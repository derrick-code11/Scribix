import { v4 as uuid } from "uuid";
import { prisma } from "../config/prisma.js";
import { AppError } from "../lib/api-error.js";
import {
  encodeCursor,
  postCursorWhere,
  clampLimit,
  type CursorPage,
  type PostSortField,
} from "../lib/pagination.js";
import { generateSlug, ensureUniqueSlug } from "../lib/slug.js";
import { upsertTagsByName } from "./tag.service.js";
import type { Prisma } from "@prisma/client";

export async function createPost(userId: string, title: string) {
  const baseSlug = generateSlug(title) || "untitled";
  const slug = await ensureUniqueSlug(userId, baseSlug);

  const post = await prisma.post.create({
    data: {
      id: uuid(),
      authorUserId: userId,
      title,
      slug,
      status: "draft",
      contentJson: { type: "doc", content: [] },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
    },
  });

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: post.status,
    created_at: post.createdAt,
  };
}

interface ListPostsQuery {
  status?: string;
  q?: string;
  tag?: string;
  sort?: string;
  order?: string;
  cursor?: string;
  limit?: string;
  include_deleted?: string;
}

export async function listOwnPosts(
  userId: string,
  query: ListPostsQuery,
): Promise<CursorPage<Record<string, unknown>>> {
  const limit = clampLimit(query.limit, 50, 20);
  const order: "asc" | "desc" = query.order === "asc" ? "asc" : "desc";
  const sortField: PostSortField =
    query.sort === "published_at"
      ? "publishedAt"
      : query.sort === "created_at"
        ? "createdAt"
        : "updatedAt";

  const where: Prisma.PostWhereInput = {
    authorUserId: userId,
    deletedAt: query.include_deleted === "true" ? undefined : null,
    ...(query.status === "draft" && { status: "draft" }),
    ...(query.status === "published" && { status: "published" }),
    ...(query.tag && {
      postTags: { some: { tag: { slug: query.tag } } },
    }),
    ...(query.q && {
      OR: [
        { title: { contains: query.q, mode: "insensitive" as const } },
        { contentText: { contains: query.q, mode: "insensitive" as const } },
      ],
    }),
  };

  const cursorFilter = postCursorWhere(sortField, order, query.cursor);

  const take = limit + 1;
  const posts = await prisma.post.findMany({
    where: { ...where, ...cursorFilter },
    orderBy: [{ [sortField]: order }, { id: order }],
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      excerpt: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      coverMedia: { select: { publicUrl: true } },
      postTags: {
        select: { tag: { select: { id: true, name: true, slug: true } } },
      },
    },
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;
  const lastItem = items[items.length - 1];

  return {
    items: items.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      excerpt: p.excerpt,
      cover_url: p.coverMedia?.publicUrl ?? null,
      tags: p.postTags.map((pt) => pt.tag),
      published_at: p.publishedAt,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
      deleted_at: p.deletedAt,
    })),
    page_info: {
      next_cursor:
        hasMore && lastItem
          ? encodeCursor(lastItem[sortField]!, lastItem.id)
          : null,
      has_more: hasMore,
    },
  };
}

export async function getOwnPost(userId: string, postId: string) {
  const post = await prisma.post.findFirst({
    where: { id: postId, authorUserId: userId },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      contentJson: true,
      contentText: true,
      excerpt: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      coverMediaId: true,
      coverMedia: {
        select: { id: true, publicUrl: true, width: true, height: true },
      },
      postTags: {
        select: { tag: { select: { id: true, name: true, slug: true } } },
      },
    },
  });

  if (!post) throw AppError.notFound("Post");

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: post.status,
    content_json: post.contentJson,
    content_text: post.contentText,
    excerpt: post.excerpt,
    cover: post.coverMedia
      ? {
          id: post.coverMedia.id,
          url: post.coverMedia.publicUrl,
          width: post.coverMedia.width,
          height: post.coverMedia.height,
        }
      : null,
    tags: post.postTags.map((pt) => pt.tag),
    published_at: post.publishedAt,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
    deleted_at: post.deletedAt,
  };
}

interface UpdatePostData {
  title?: string;
  content_json?: unknown;
  content_text?: string | null;
  excerpt?: string | null;
  cover_media_id?: string | null;
  tags?: string[];
}

export async function updatePost(
  userId: string,
  postId: string,
  data: UpdatePostData,
) {
  const existing = await prisma.post.findFirst({
    where: { id: postId, authorUserId: userId, deletedAt: null },
    select: { id: true, status: true, slug: true },
  });

  if (!existing) throw AppError.notFound("Post");

  const updateData: Prisma.PostUpdateInput = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
    if (existing.status === "draft") {
      const baseSlug = generateSlug(data.title) || "untitled";
      updateData.slug = await ensureUniqueSlug(userId, baseSlug, postId);
    }
  }
  if (data.content_json !== undefined)
    updateData.contentJson = data.content_json as Prisma.InputJsonValue;
  if (data.content_text !== undefined) updateData.contentText = data.content_text;
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
  if (data.cover_media_id !== undefined) {
    updateData.coverMedia = data.cover_media_id
      ? { connect: { id: data.cover_media_id } }
      : { disconnect: true };
  }

  const post = await prisma.post.update({
    where: { id: postId },
    data: updateData,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      updatedAt: true,
    },
  });

  if (data.tags !== undefined) {
    const tagRecords = await upsertTagsByName(data.tags);
    await prisma.postTag.deleteMany({ where: { postId } });
    if (tagRecords.length > 0) {
      await prisma.postTag.createMany({
        data: tagRecords.map((t) => ({ postId, tagId: t.id })),
        skipDuplicates: true,
      });
    }
  }

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: post.status,
    updated_at: post.updatedAt,
  };
}

export async function publishPost(userId: string, postId: string) {
  const post = await prisma.post.findFirst({
    where: { id: postId, authorUserId: userId, deletedAt: null },
    select: { id: true, title: true, contentJson: true, publishedAt: true },
  });

  if (!post) throw AppError.notFound("Post");

  const content = post.contentJson as { content?: unknown[] } | null;
  if (!post.title || !content?.content?.length) {
    throw AppError.badRequest(
      "PUBLISH_REQUIREMENTS",
      "Post must have a title and content to publish",
    );
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      status: "published",
      publishedAt: post.publishedAt ?? new Date(),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    slug: updated.slug,
    status: updated.status,
    published_at: updated.publishedAt,
  };
}

export async function unpublishPost(userId: string, postId: string) {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      authorUserId: userId,
      status: "published",
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!post) throw AppError.notFound("Post");

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { status: "draft" },
    select: { id: true, status: true },
  });

  return { id: updated.id, status: updated.status };
}

export async function softDeletePost(userId: string, postId: string) {
  const post = await prisma.post.findFirst({
    where: { id: postId, authorUserId: userId, deletedAt: null },
    select: { id: true },
  });

  if (!post) throw AppError.notFound("Post");

  await prisma.post.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
  });

  return { id: postId, deleted: true };
}

export async function restorePost(userId: string, postId: string) {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      authorUserId: userId,
      deletedAt: { not: null },
    },
    select: { id: true },
  });

  if (!post) throw AppError.notFound("Post");

  await prisma.post.update({
    where: { id: postId },
    data: { deletedAt: null },
  });

  return { id: postId, restored: true };
}
