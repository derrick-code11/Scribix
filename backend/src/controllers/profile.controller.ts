import type { Request, Response } from "express";
import * as profileService from "../services/profile.service.js";
import { success } from "../lib/api-response.js";

export async function getPublicProfileHandler(req: Request, res: Response) {
  const data = await profileService.getPublicProfile(
    req.params.username as string
  );
  success(res, data);
}
