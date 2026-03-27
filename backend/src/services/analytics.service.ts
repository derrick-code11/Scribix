import { prisma } from "../config/prisma.js";
import { AppError } from "../lib/api-error.js";
import type { ViewSource } from "../generated/prisma/client.js";

function rangeToDate(range: string): Date {
  const now = new Date();
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function todayDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function trackView(postId: string, source: string) {
  const validSources: ViewSource[] = ["profile", "post", "embed", "unknown"];
  const src = validSources.includes(source as ViewSource)
    ? (source as ViewSource)
    : "unknown";

  const viewDate = todayDate();

  await prisma.$executeRaw`
    INSERT INTO post_views_daily (post_id, view_date, source, views_count, created_at, updated_at)
    VALUES (${postId}::uuid, ${viewDate}::date, ${src}::"ViewSource", 1, NOW(), NOW())
    ON CONFLICT (post_id, view_date, source)
    DO UPDATE SET views_count = post_views_daily.views_count + 1, updated_at = NOW()
  `;
}

export async function getOverview(userId: string, range: string) {
  const since = rangeToDate(range);

  const posts = await prisma.post.findMany({
    where: { authorUserId: userId, deletedAt: null },
    select: { id: true },
  });

  if (posts.length === 0) {
    return { total_views: 0, top_posts: [] };
  }

  const postIds = posts.map((p) => p.id);

  const aggregates = await prisma.postViewsDaily.groupBy({
    by: ["postId"],
    where: {
      postId: { in: postIds },
      viewDate: { gte: since },
    },
    _sum: { viewsCount: true },
    orderBy: { _sum: { viewsCount: "desc" } },
    take: 5,
  });

  const totalResult = await prisma.postViewsDaily.aggregate({
    where: {
      postId: { in: postIds },
      viewDate: { gte: since },
    },
    _sum: { viewsCount: true },
  });

  const topPostIds = aggregates.map((a) => a.postId);
  const topPosts = await prisma.post.findMany({
    where: { id: { in: topPostIds } },
    select: { id: true, title: true, slug: true },
  });

  const postMap = new Map(topPosts.map((p) => [p.id, p]));

  return {
    total_views: totalResult._sum.viewsCount ?? 0,
    top_posts: aggregates.map((a) => ({
      post_id: a.postId,
      title: postMap.get(a.postId)?.title ?? "",
      slug: postMap.get(a.postId)?.slug ?? "",
      views: a._sum.viewsCount ?? 0,
    })),
  };
}

export async function getPostViews(
  userId: string,
  postId: string,
  range: string,
  source: string
) {
  const post = await prisma.post.findFirst({
    where: { id: postId, authorUserId: userId, deletedAt: null },
    select: { id: true },
  });

  if (!post) throw AppError.notFound("Post");

  const since = rangeToDate(range);

  const sourceFilter =
    source && source !== "all" ? { source: source as ViewSource } : {};

  const daily = await prisma.postViewsDaily.findMany({
    where: {
      postId,
      viewDate: { gte: since },
      ...sourceFilter,
    },
    orderBy: { viewDate: "asc" },
  });

  const dateMap = new Map<string, number>();
  let total = 0;

  for (const row of daily) {
    const key = row.viewDate.toISOString().slice(0, 10);
    dateMap.set(key, (dateMap.get(key) ?? 0) + row.viewsCount);
    total += row.viewsCount;
  }

  const series = Array.from(dateMap.entries()).map(([date, views]) => ({
    date,
    views,
  }));

  return { total_views: total, series };
}
