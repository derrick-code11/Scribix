import type { Request, Response, NextFunction } from "express";

// Express 5: `req.query` is non-writable on the prototype; assign a plain object per request.
export function express5QueryCompat(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const parsed = req.query;
  let plain: Record<string, unknown>;
  if (!parsed || typeof parsed !== "object") {
    plain = {};
  } else if (Array.isArray(parsed)) {
    plain = {};
  } else {
    plain = { ...(parsed as Record<string, unknown>) };
  }
  Object.defineProperty(req, "query", {
    value: plain,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  next();
}
