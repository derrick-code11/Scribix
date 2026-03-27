import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { success } from "../lib/api-response.js";

export async function getMeHandler(req: Request, res: Response) {
  const data = await authService.getMe(req.user!.userId);
  success(res, data, "Authenticated user loaded");
}
