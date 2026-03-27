import { Router } from "express";
import { getEmbedPostsHandler } from "../controllers/embed.controller.js";
import { embedLimiter } from "../middlewares/rate-limit.js";
import { cacheEmbed } from "../middlewares/cache.js";

const router = Router();

router.use(embedLimiter);

router.get("/:username/posts", cacheEmbed(300), getEmbedPostsHandler);

export default router;
