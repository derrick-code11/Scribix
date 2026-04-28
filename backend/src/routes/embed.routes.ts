import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import {
  getEmbedPostsHandler,
  getEmbedSdkHandler,
} from "../controllers/embed.controller.js";
import { embedLimiter } from "../middlewares/rate-limit.js";
import { cacheEmbed } from "../middlewares/cache.js";

const router = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  // Public embed endpoints must be consumable from arbitrary host pages.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

router.use(embedLimiter);

router.get("/sdk.js", cacheEmbed(300), getEmbedSdkHandler);
router.get("/:username/posts", cacheEmbed(300), getEmbedPostsHandler);

export default router;
