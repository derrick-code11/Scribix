import type { Request, Response, NextFunction } from "express";

/**
 * Express 5 exposes `req.query` as a getter on the request prototype, so
 * assigning `req.query = …` throws. Router `restore()` and some libraries still
 * write to it. Shadow with a writable own property per request (parsed once).
 */
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
