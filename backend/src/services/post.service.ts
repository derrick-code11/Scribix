import { randomUUID } from "crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../lib/api-error.js";
import { generateSlug, ensureUniqueSlug, isValidSlug } from "../lib/slug.js";
import { encodeCursor, decodeCursor, type CursorPage } from "../lib/pagination.js";
import { upsertTags, syncPostTags } from "./tag.service.js";
import type {
  CreatePostInput,
  ListPostsInput,
  UpdatePostInput,
} from "../validators/post.validators.js";
import type { Prisma } from "../generated/prisma/client.js";

const postSelect = {
  id: true,
  title: true,
  slug: true,
  status: true,
  excerpt: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  coverMedia: { select: { id: true, publicUrl: true } },
  postTags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
} satisfies Prisma.PostSelect;

const postDetailSelect = {
  ...postSelect,
  contentJson: true,
  contentText: true,
} satisfies Prisma.PostSelect;

export async function createDraft(userId: string, input: CreatePostInput) {
  const baseSlug = generateSlug(input.title);
  const slug = await ensureUniqueSlug(userId, baseSlug);

  const post = await prisma.post.create({
    data: {
      id: randomUUID(),
      authorUserId: userId,
      title: input.title,
      slug,
      status: "draft",
      contentJson: {},
    },
    select: postSelect,
  });

  return formatPost(post);
}

export async function listOwnerPosts(
  userId: string,
  input: ListPostsInput
): Promise<CursorPage<ReturnType<typeof formatPost>>> {
  const where: Prisma.PostWhereInput = {
    authorUserId: userId,
    ...(input.status !== "all" && { status: input.status }),
    ...(input.include_deleted ? {} : { deletedAt: null }),
    ...(input.q && {
      OR: [
        { title: { contains: input.q, mode: "insensitive" } },
        { contentText: { contains: input.q, mode: "insensitive" } },
      ],
    }),
    ...(input.tag && {
      postTags: { some: { tag: { slug: input.tag } } },
    }),
  };

  const sortField = input.sort;
  const order = input.order;
  const take = input.limit + 1;

  let cursorFilter: Prisma.PostWhereInput = {};
  if (input.cursor) {
    const decoded = decodeCursor(input.cursor);
    if (decoded) {
      const op = order === "desc" ? "lt" : "gt";
      cursorFilter = {
        OR: [
          { [sortField]: { [op]: new Date(decoded.sortValue) } },
          {
            [sortField]: new Date(decoded.sortValue),
            id: { [op]: decoded.id },
          },
        ],
      };
    }
  }

  const posts = await prisma.post.findMany({
    where: { ...where, ...cursorFilter },
    orderBy: [{ [sortField]: order }, { id: order }],
    take,
    select: postSelect,
  });

  const hasMore = posts.length > input.limit;
  const items = hasMore ? posts.slice(0, input.limit) : posts;
  const lastItem = items[items.length - 1];

  return {
    items: items.map(formatPost),
    page_info: {
      next_cursor: hasMore && lastItem
        ? encodeCursor(
            (lastItem as any)[sortField] ?? lastItem.createdAt,
            lastItem.id
          )
        : null,
      has_more: hasMore,
    },
  };
}

export async function getPostForEditor(userId: string, postId: string) {
  const post = await prisma.post.findFirst({
    where: { id: postId, authorUserId: userId },
    select: postDetailSelect,
  });

  if (!post) throw AppError.notFound("Post");

  return formatPost(post);
}

export async function updatePost(
  userId: string,
  postId: string,
  input: UpdatePostInput
) {
  const existing = await prisma.post.findFirst({
    where: { id: postId, authorUserId: userId, deletedAt: null },
    select: { id: true, status: true, slug: true },
  });

  if (!existing) throw AppError.notFound("Post");

  const data: Prisma.PostUpdateInput = {};

  if (input.title !== undefined) {
    data.title = input.title;
    if (existing.status === "draft") {
      const baseSlug = generateSlug(input.title);
      data.slug = await ensureUniqueSlug(userId, baseSlug, postId);
    }
  }

  if (input.content_json !== undefined) data.contentJson = input.content_json;
  if (input.content_text !== undefined) data.contentText = input.content_text;
  if (input.excerpt !== undefined) data.excerpt = input.excerpt;
  if (input.cover_media_id !== undefined) {
    data.coverMedia = input.cover_media_id
      ? { connect: { id: input.cover_media_id } }
      : { disconnect: true };
  }

  const post = await prisma.post.update({
    where: { id: postId },
    data,
    select: postDetailSelect,
  });

  if (input.tags !== undefined) {
    const tagIds = await upsertTags(input.tags);
    await syncPostTags(postId, tagIds);
  }

  const updated = await prisma.post.findUnique({
    where: { id: postId },
    select: postDetailSelect,
  });

  return formatPost(updated!);
}

export async function setSlug(userId: string, postId: string, slug: string) {
  const existing = await prisma.post.findFirst({
    where: { id: postId, authorUserId: userId, deletedAt: null },
    select: { id: true, status: true },
  });

  if (!existing) throw AppError.notFound("Post");

  if (existing.status !== "draft") {
    throw AppError.badRequest(
      "SLUG_FROZEN",
      "Slug can only be changed while the post is a draft"
    );
  }

  if (!isValidSlug(slug)) {
    throw AppError.badRequest("INVALID_SLUG", "Slug format is invalid");
  }

  const conflict = await prisma.post.findFirst({
    where: {
      authorUserId: userId,
      slug,
      deletedAt: null,
      id: { not: postId },
    },
    select: { id: true },
  });

  if (conflict) {
    throw AppError.conflict("SLUG_TAKEN", "This slug is already used by another post", {
      slug,
    });
  }

  const post = await prisma.post.update({
    where: { id: postId },
    data: { slug },
    select: postSelect,
  });

  return formatPost(post);
}

export async function publish(userId: string, postId: string) {
  const existing = await prisma.post.findFirst({
    where: { id: postId, authorUserId: userId, deletedAt: null },
    select: { id: true, title: true, contentJson: true, publishedAt: true },
  });

  if (!existing) throw AppError.notFound("Post");

  if (!existing.title || existing.title === "Untitled Post") {
    throw AppError.unprocessable(
      "PUBLISH_VALIDATION",
      "Post must have a title before publishing"
    );
  }

  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      status: "published",
      publishedAt: existing.publishedAt ?? new Date(),
    },
    select: postSelect,
  });

  return formatPost(post);
}

export async function unpublish(userId: string, postId: string) {
  const existing = await prisma.post.findFirst({
    where: { id: postId, authorUserId: userId, deletedAt: null },
    select: { id: true },
  });

  if (!existing) throw AppError.notFound("Post");

  const post = await prisma.post.update({
    where: { id: postId },
    data: { status: "draft" },
    select: postSelect,
  });

  return formatPost(post);
}

export async function softDelete(userId: string, postId: string) {
  const existing = await prisma.post.findFirst({
    where: { id: postId, authorUserId: userId, deletedAt: null },
    select: { id: true },
  });

  if (!existing) throw AppError.notFound("Post");

  await prisma.post.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
  });
}

export async function restore(userId: string, postId: string) {
  const existing = await prisma.post.findFirst({
    where: { id: postId, authorUserId: userId, deletedAt: { not: null } },
    select: { id: true },
  });

  if (!existing) throw AppError.notFound("Post");

  const post = await prisma.post.update({
    where: { id: postId },
    data: { deletedAt: null },
    select: postSelect,
  });

  return formatPost(post);
}

function formatPost(post: Record<string, any>) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: post.status,
    excerpt: post.excerpt ?? null,
    cover: post.coverMedia
      ? { id: post.coverMedia.id, url: post.coverMedia.publicUrl }
      : null,
    tags: post.postTags?.map((pt: any) => pt.tag) ?? [],
    published_at: post.publishedAt ?? null,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
    deleted_at: post.deletedAt ?? null,
    ...(post.contentJson !== undefined && { content_json: post.contentJson }),
    ...(post.contentText !== undefined && { content_text: post.contentText }),
  };
}
