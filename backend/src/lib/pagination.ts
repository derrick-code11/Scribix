import type { Prisma } from "@prisma/client";

export interface CursorPage<T> {
  items: T[];
  page_info: {
    next_cursor: string | null;
    has_more: boolean;
  };
}

export type PostSortField = "publishedAt" | "createdAt" | "updatedAt";

interface CursorData {
  sortValue: string;
  id: string;
}

export function encodeCursor(sortValue: string | Date, id: string): string {
  const sv = sortValue instanceof Date ? sortValue.toISOString() : sortValue;
  return Buffer.from(JSON.stringify({ sortValue: sv, id })).toString("base64url");
}

export function decodeCursor(cursor: string): CursorData | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (typeof parsed.sortValue === "string" && typeof parsed.id === "string") {
      return parsed as CursorData;
    }
    return null;
  } catch {
    return null;
  }
}

export function postCursorWhere(
  sortField: PostSortField,
  order: "asc" | "desc",
  cursor: string | undefined,
): Prisma.PostWhereInput {
  if (!cursor) return {};
  const decoded = decodeCursor(cursor);
  if (!decoded) return {};
  const op = order === "desc" ? "lt" : "gt";
  return {
    OR: [
      { [sortField]: { [op]: new Date(decoded.sortValue) } },
      {
        [sortField]: new Date(decoded.sortValue),
        id: { [op]: decoded.id },
      },
    ],
  };
}

export function clampLimit(limit: unknown, max: number, defaultVal: number): number {
  const n = typeof limit === "string" ? parseInt(limit, 10) : Number(limit);
  if (isNaN(n) || n < 1) return defaultVal;
  return Math.min(n, max);
}
