import { z } from "zod";

export const createPostBody = z.object({
  title: z.string().min(1, "Title is required").max(300).default("Untitled Post"),
});

export const listPostsQuery = z.object({
  status: z.enum(["draft", "published", "all"]).default("all"),
  q: z.string().max(200).optional(),
  tag: z.string().max(100).optional(),
  include_deleted: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  sort: z.enum(["updated_at", "published_at", "created_at"]).default("updated_at"),
  order: z.enum(["desc", "asc"]).default("desc"),
  cursor: z.string().optional(),
  limit: z
    .string()
    .default("20")
    .transform((v) => Math.min(Math.max(parseInt(v, 10) || 20, 1), 50)),
});

export const updatePostBody = z.object({
  title: z.string().min(1).max(300).optional(),
  content_json: z.any().optional(),
  content_text: z.string().nullable().optional(),
  excerpt: z.string().max(500).nullable().optional(),
  cover_media_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
});

export const setSlugBody = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    ),
});

export const postIdParams = z.object({
  postId: z.string().uuid(),
});

export type CreatePostInput = z.infer<typeof createPostBody>;
export type ListPostsInput = z.infer<typeof listPostsQuery>;
export type UpdatePostInput = z.infer<typeof updatePostBody>;
export type SetSlugInput = z.infer<typeof setSlugBody>;
