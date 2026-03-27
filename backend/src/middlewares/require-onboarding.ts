import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";
import { AppError } from "../lib/api-error.js";

export async function requireOnboarding(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const profile = await prisma.profile.findUnique({
    where: { userId: req.user!.userId },
    select: { id: true },
  });

  if (!profile) {
    throw AppError.forbidden("Onboarding incomplete. Please set up your profile first.");
  }

  next();
}
