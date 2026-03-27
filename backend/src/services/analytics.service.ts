import { prisma } from "../config/prisma.js";
import type { ViewSource } from "@prisma/client";

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
