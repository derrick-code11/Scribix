import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err.stack);
  res.status(500).json({
    error: env.nodeEnv === "production" ? "Internal server error" : err.message,
  });
}
