import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";
import { success } from "../lib/api-response.js";
import { AppError } from "../lib/api-error.js";

export async function getMeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { sub, email } = req.auth!;
    const user = await authService.getOrCreateUser(sub, email);
    const context = await authService.getAuthContext(user.id);
    if (!context) throw AppError.notFound("User");
    success(res, context, "Authenticated user loaded");
  } catch (err) {
    next(err);
  }
}
