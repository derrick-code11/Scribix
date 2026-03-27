import { Router } from "express";
import {
  getPublicPostsHandler,
  getPublicPostDetailHandler,
} from "../controllers/public.controller.js";
import { publicLimiter } from "../middlewares/rate-limit.js";
import { cachePublic } from "../middlewares/cache.js";

const router = Router();

router.use(publicLimiter);

router.get("/:username/posts", cachePublic(60), getPublicPostsHandler);
router.get("/:username/posts/:slug", cachePublic(60), getPublicPostDetailHandler);

export default router;
