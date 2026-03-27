import type { Request, Response } from "express";
import * as mediaService from "../services/media.service.js";
import { success } from "../lib/api-response.js";
import type {
  UploadUrlInput,
  RegisterMediaInput,
} from "../validators/media.validators.js";

export async function getUploadUrlHandler(req: Request, res: Response) {
  const data = await mediaService.generateUploadUrl(
    req.user!.userId,
    req.body as UploadUrlInput
  );
  success(res, data, "Upload URL generated");
}

export async function registerMediaHandler(req: Request, res: Response) {
  const asset = await mediaService.registerAsset(
    req.user!.userId,
    req.body as RegisterMediaInput
  );
  success(res, asset, "Media asset registered", 201);
}

export async function deleteMediaHandler(req: Request, res: Response) {
  const { mediaId } = req.validatedParams as { mediaId: string };
  await mediaService.softDeleteAsset(req.user!.userId, mediaId);
  success(res, null, "Media asset deleted");
}
