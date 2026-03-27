import { prisma } from "../config/prisma.js";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 120;

export function slugifySegment(input: string, maxLength: number): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLength);
}

export function generateSlug(title: string): string {
  return slugifySegment(title, MAX_SLUG_LENGTH);
}

export function isValidSlug(slug: string): boolean {
  return (
    SLUG_REGEX.test(slug) && slug.length > 0 && slug.length <= MAX_SLUG_LENGTH
  );
}

export async function ensureUniqueSlug(
  authorUserId: string,
  baseSlug: string,
  excludePostId?: string,
): Promise<string> {
  let slug = baseSlug || "untitled";
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const existing = await prisma.post.findFirst({
      where: {
        authorUserId,
        slug: candidate,
        ...(excludePostId && { id: { not: excludePostId } }),
      },
      select: { id: true },
    });

    if (!existing) return candidate;
    suffix++;
  }
}
