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
    if (user.status === "deleted") {
      throw AppError.forbidden("This account has been deleted");
    }
    const context = await authService.getAuthContext(user.id);
    if (!context) throw AppError.notFound("User");
    success(res, context, "Authenticated user loaded");
  } catch (err) {
    next(err);
  }
}

export async function deleteMeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = await authService.resolveLocalUserId(req.auth!.sub);
    await authService.deleteAccount(userId);
    success(res, { deleted: true }, "Account deleted");
  } catch (err) {
    next(err);
  }
}
