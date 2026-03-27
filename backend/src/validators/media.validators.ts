import { z } from "zod";

const allowedMimeTypes = ["image/png", "image/jpeg"] as const;
const assetTypes = ["avatar", "cover_image", "other"] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const uploadUrlBody = z.object({
  file_name: z.string().min(1).max(255),
  mime_type: z.enum(allowedMimeTypes, {
    error: "Only image/png and image/jpeg are allowed",
  }),
  file_size_bytes: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE, "File size must be under 10 MB"),
  asset_type: z.enum(assetTypes),
});

export const registerMediaBody = z.object({
  storage_key: z.string().min(1).max(500),
  asset_type: z.enum(assetTypes),
  mime_type: z.enum(allowedMimeTypes),
  file_size_bytes: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const mediaIdParams = z.object({
  mediaId: z.string().uuid(),
});

export type UploadUrlInput = z.infer<typeof uploadUrlBody>;
export type RegisterMediaInput = z.infer<typeof registerMediaBody>;
