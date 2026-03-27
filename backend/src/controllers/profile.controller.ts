import type { Request, Response } from "express";
import * as profileService from "../services/profile.service.js";
import { AppError } from "../lib/api-error.js";
import { success } from "../lib/api-response.js";
import type {
  UpdateProfileInput,
  ReplaceLinksInput,
} from "../validators/profile.validators.js";

export async function checkUsernameHandler(req: Request, res: Response) {
  const q = req.validatedQuery as { username?: string } | undefined;
  const username = q?.username;
  if (typeof username !== "string") {
    throw AppError.badRequest(
      "VALIDATION_ERROR",
      "username query parameter is required"
    );
  }
  const data = await profileService.checkUsernameAvailability(username);
  success(res, data);
}

export async function updateProfileHandler(req: Request, res: Response) {
  const data = await profileService.upsertProfile(
    req.user!.userId,
    req.body as UpdateProfileInput
  );
  success(res, data, "Profile updated");
}

export async function replaceLinksHandler(req: Request, res: Response) {
  const links = await profileService.replaceLinks(
    req.user!.userId,
    req.body as ReplaceLinksInput
  );
  success(res, { links }, "Links updated");
}

export async function getMyProfileHandler(req: Request, res: Response) {
  const data = await profileService.getEditableProfile(req.user!.userId);
  success(res, data);
}

export async function getPublicProfileHandler(req: Request, res: Response) {
  const data = await profileService.getPublicProfile(
    req.params.username as string
  );
  success(res, data);
}
