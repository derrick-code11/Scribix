import type { Request, Response, NextFunction } from "express";

export function cachePublic(maxAge = 60) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.set("Cache-Control", `public, max-age=${maxAge}, s-maxage=${maxAge * 2}`);
    next();
  };
}

export function cacheEmbed(maxAge = 300) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.set(
      "Cache-Control",
      `public, max-age=${maxAge}, s-maxage=${maxAge * 2}, stale-while-revalidate=${maxAge}`
    );
    next();
  };
}

export function noCache(_req: Request, res: Response, next: NextFunction) {
  res.set("Cache-Control", "no-store");
  next();
}
