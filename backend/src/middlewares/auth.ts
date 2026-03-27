import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { AppError } from "../lib/api-error.js";
import { prisma } from "../config/prisma.js";

export interface AuthUser {
  userId: string;
  status: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw AppError.unauthorized("Missing or malformed authorization header");
  }

  const token = header.slice(7);

  try {
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, status: true },
    });

    if (!user || user.status !== "active") {
      throw AppError.unauthorized("User account is not active");
    }

    req.user = { userId: user.id, status: user.status };
    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw AppError.unauthorized("Invalid or expired token");
  }
}
