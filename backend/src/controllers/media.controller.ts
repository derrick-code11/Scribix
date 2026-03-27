import type { Request, Response, NextFunction } from "express";
import { z } from "zod/v4";
import * as mediaService from "../services/media.service.js";
import { resolveLocalUserId } from "../services/auth.service.js";
import { success } from "../lib/api-response.js";
import { AppError } from "../lib/api-error.js";

const uploadUrlSchema = z.object({
  file_name: z.string().min(1),
  mime_type: z.string(),
  file_size_bytes: z.number().int().positive(),
  asset_type: z.enum(["avatar", "cover_image", "other"]),
});

const registerMediaSchema = z.object({
  storage_key: z.string().min(1),
  asset_type: z.enum(["avatar", "cover_image", "other"]),
  mime_type: z.string(),
  file_size_bytes: z.number().int().positive(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
});

export async function uploadUrlHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = uploadUrlSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.badRequest("VALIDATION_ERROR", "Invalid body", {
        issues: parsed.error.issues,
      });
    }
    const userId = await resolveLocalUserId(req.auth!.sub);
    const data = await mediaService.generateUploadUrl(userId, parsed.data);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

export async function registerMediaHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = registerMediaSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.badRequest("VALIDATION_ERROR", "Invalid body", {
        issues: parsed.error.issues,
      });
    }
    const userId = await resolveLocalUserId(req.auth!.sub);
    const data = await mediaService.registerMediaAsset(userId, parsed.data);
    success(res, data, "Media registered", 201);
  } catch (err) {
    next(err);
  }
}
