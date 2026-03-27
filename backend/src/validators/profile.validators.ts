import { z } from "zod";

const usernameRegex = /^[a-z0-9_]{3,30}$/;

export const usernameAvailabilityQuery = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(usernameRegex, "Username must be lowercase letters, numbers, or underscores"),
});

export const updateProfileBody = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(usernameRegex, "Username must be lowercase letters, numbers, or underscores")
    .optional(),
  display_name: z.string().min(1, "Display name is required").max(100).optional(),
  bio: z.string().max(500).nullable().optional(),
  avatar_media_id: z.string().uuid().nullable().optional(),
});

const linkTypeEnum = z.enum(["portfolio", "github", "linkedin", "x", "other"]);

const profileLinkSchema = z.object({
  link_type: linkTypeEnum,
  label: z.string().max(50).nullable().optional(),
  url: z.string().url("Invalid URL").max(500),
  position: z.number().int().min(0),
});

export const replaceLinksBody = z.object({
  links: z.array(profileLinkSchema).max(10, "Maximum 10 links allowed"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileBody>;
export type ReplaceLinksInput = z.infer<typeof replaceLinksBody>;
