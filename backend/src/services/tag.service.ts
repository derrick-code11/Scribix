import { v4 as uuid } from "uuid";
import { prisma } from "../config/prisma.js";
import { slugifySegment } from "../lib/slug.js";

const TAG_SLUG_MAX = 60;

export async function searchTags(query?: string) {
  const where = query
    ? { name: { contains: query, mode: "insensitive" as const } }
    : {};

  const tags = await prisma.tag.findMany({
    where,
    orderBy: { name: "asc" },
    take: 20,
    select: { id: true, name: true, slug: true },
  });

  return tags;
}

export async function upsertTagsByName(
  names: string[],
): Promise<{ id: string; name: string; slug: string }[]> {
  if (names.length === 0) return [];

  const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  const results: { id: string; name: string; slug: string }[] = [];

  for (const name of unique) {
    const slug = slugifySegment(name, TAG_SLUG_MAX);
    if (!slug) continue;

    const existing = await prisma.tag.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });

    if (existing) {
      results.push(existing);
    } else {
      const tag = await prisma.tag.create({
        data: { id: uuid(), name, slug },
        select: { id: true, name: true, slug: true },
      });
      results.push(tag);
    }
  }

  return results;
}
