import { randomUUID } from "crypto";
import { prisma } from "../config/prisma.js";

function slugifyTag(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function upsertTags(tagNames: string[]): Promise<string[]> {
  const ids: string[] = [];

  for (const name of tagNames) {
    const slug = slugifyTag(name);
    if (!slug) continue;

    let tag = await prisma.tag.findUnique({ where: { slug } });

    if (!tag) {
      tag = await prisma.tag.create({
        data: { id: randomUUID(), name: name.trim(), slug },
      });
    }

    ids.push(tag.id);
  }

  return ids;
}

export async function syncPostTags(postId: string, tagIds: string[]) {
  await prisma.$transaction([
    prisma.postTag.deleteMany({ where: { postId } }),
    ...tagIds.map((tagId) =>
      prisma.postTag.create({
        data: { postId, tagId },
      })
    ),
  ]);
}

export async function searchTags(query?: string) {
  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { slug: { contains: query.toLowerCase() } },
        ],
      }
    : {};

  return prisma.tag.findMany({
    where,
    take: 20,
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}
