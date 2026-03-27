import type { Request, Response, NextFunction } from "express";
import { z } from "zod/v4";
import * as profileService from "../services/profile.service.js";
import { resolveLocalUserId } from "../services/auth.service.js";
import { success } from "../lib/api-response.js";
import { AppError } from "../lib/api-error.js";

export async function getPublicProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await profileService.getPublicProfile(req.params.username as string);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

export async function usernameAvailabilityHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const username = req.query.username;
    if (typeof username !== "string" || !username.trim()) {
      throw AppError.badRequest("MISSING_USERNAME", "username query param required");
    }
    const data = await profileService.checkUsernameAvailability(username);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

const upsertProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  display_name: z.string().min(1).max(100),
  bio: z.string().max(500).nullable().optional(),
  avatar_media_id: z.string().uuid().nullable().optional(),
});

export async function upsertProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = upsertProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.badRequest("VALIDATION_ERROR", "Invalid body", {
        issues: parsed.error.issues,
      });
    }
    const userId = await resolveLocalUserId(req.auth!.sub);
    const data = await profileService.upsertProfile(userId, {
      ...parsed.data,
    });
    success(res, data, "Profile updated");
  } catch (err) {
    next(err);
  }
}

export async function getOwnProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await resolveLocalUserId(req.auth!.sub);
    const data = await profileService.getOwnProfile(userId);
    success(res, data);
  } catch (err) {
    next(err);
  }
}
