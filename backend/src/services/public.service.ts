import { prisma } from "../config/prisma.js";
import { AppError } from "../lib/api-error.js";
import {
  encodeCursor,
  postCursorWhere,
  clampLimit,
  type CursorPage,
} from "../lib/pagination.js";
import type { Prisma } from "@prisma/client";

interface PublicPostsQuery {
  limit?: string;
  cursor?: string;
  tag?: string;
  sort?: string;
  order?: string;
}

export async function getPublicPostFeed(
  username: string,
  query: PublicPostsQuery
): Promise<CursorPage<Record<string, unknown>>> {
  const profile = await prisma.profile.findUnique({
    where: { username: username.toLowerCase() },
    select: { userId: true },
  });

  if (!profile) throw AppError.notFound("Profile");

  const limit = clampLimit(query.limit, 30, 10);
  const order: "asc" | "desc" = query.order === "asc" ? "asc" : "desc";
  const where: Prisma.PostWhereInput = {
    authorUserId: profile.userId,
    status: "published",
    deletedAt: null,
    ...(query.tag && {
      postTags: { some: { tag: { slug: query.tag } } },
    }),
  };

  const cursorFilter = postCursorWhere("publishedAt", order, query.cursor);

  const take = limit + 1;
  const posts = await prisma.post.findMany({
    where: { ...where, ...cursorFilter },
    orderBy: [{ publishedAt: order }, { id: order }],
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      coverMedia: { select: { publicUrl: true } },
      postTags: {
        select: { tag: { select: { name: true, slug: true } } },
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
      excerpt: p.excerpt,
      cover_url: p.coverMedia?.publicUrl ?? null,
      tags: p.postTags.map((pt) => pt.tag),
      published_at: p.publishedAt,
    })),
    page_info: {
      next_cursor:
        hasMore && lastItem
          ? encodeCursor(lastItem.publishedAt!, lastItem.id)
          : null,
      has_more: hasMore,
    },
  };
}

export async function getPublicPostDetail(username: string, slug: string) {
  const profile = await prisma.profile.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      userId: true,
      username: true,
      displayName: true,
      bio: true,
      avatarMedia: { select: { publicUrl: true } },
    },
  });

  if (!profile) throw AppError.notFound("Profile");

  const post = await prisma.post.findFirst({
    where: {
      authorUserId: profile.userId,
      slug,
      status: "published",
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      contentJson: true,
      contentText: true,
      excerpt: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      coverMedia: { select: { publicUrl: true, width: true, height: true } },
      postTags: {
        select: { tag: { select: { name: true, slug: true } } },
      },
    },
  });

  if (!post) throw AppError.notFound("Post");

  return {
    post: {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content_json: post.contentJson,
      content_text: post.contentText,
      excerpt: post.excerpt,
      cover: post.coverMedia
        ? {
            url: post.coverMedia.publicUrl,
            width: post.coverMedia.width,
            height: post.coverMedia.height,
          }
        : null,
      tags: post.postTags.map((pt) => pt.tag),
      published_at: post.publishedAt,
      updated_at: post.updatedAt,
    },
    author: {
      username: profile.username,
      display_name: profile.displayName,
      bio: profile.bio,
      avatar_url: profile.avatarMedia?.publicUrl ?? null,
    },
    seo: {
      title: post.title,
      description: post.excerpt || post.contentText?.slice(0, 160) || "",
      og_image: post.coverMedia?.publicUrl ?? null,
      canonical_url: `/${profile.username}/${post.slug}`,
    },
  };
}

interface EmbedFeedQuery {
  limit?: string;
  offset?: string;
}

interface EmbedFeedOptions {
  siteOrigin?: string;
}

function clampOffset(offset: unknown, max: number): number {
  const n = typeof offset === "string" ? parseInt(offset, 10) : Number(offset);
  if (isNaN(n) || n < 0) return 0;
  return Math.min(n, max);
}

export async function getEmbedFeed(
  username: string,
  query: EmbedFeedQuery,
  options: EmbedFeedOptions = {}
) {
  const profile = await prisma.profile.findUnique({
    where: { username: username.toLowerCase() },
    select: { userId: true, username: true },
  });

  if (!profile) throw AppError.notFound("Profile");

  const limit = clampLimit(query.limit, 20, 6);
  const offset = clampOffset(query.offset, 200);

  const posts = await prisma.post.findMany({
    where: {
      authorUserId: profile.userId,
      status: "published",
      deletedAt: null,
    },
    orderBy: { publishedAt: "desc" },
    skip: offset,
    take: limit + 1,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
    },
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;
  const siteOrigin = options.siteOrigin?.replace(/\/$/, "") ?? null;

  return {
    username: profile.username,
    items: items.map((p) => ({
      title: p.title,
      slug: p.slug,
      url: `/${profile.username}/${p.slug}`,
      absolute_url: siteOrigin
        ? `${siteOrigin}/${profile.username}/${p.slug}`
        : null,
      excerpt: p.excerpt,
      published_at: p.publishedAt,
    })),
    page_info: {
      limit,
      offset,
      returned: items.length,
      has_more: hasMore,
      next_offset: hasMore ? offset + items.length : null,
    },
  };
}
