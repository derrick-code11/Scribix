import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/api-error.js";
import { error } from "../lib/api-response.js";
import { env } from "../config/env.js";

export function notFoundHandler(req: Request, res: Response) {
  error(res, 404, "NOT_FOUND", `Route ${req.method} ${req.path} not found`);
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return error(res, err.statusCode, err.code, err.message, err.details);
  }

  console.error(err.stack);
  const message =
    env.nodeEnv === "production" ? "Internal server error" : err.message;
  return error(res, 500, "INTERNAL_ERROR", message);
}
