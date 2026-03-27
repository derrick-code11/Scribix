import { Router } from "express";
import {
  getOverviewHandler,
  getPostViewsHandler,
} from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.use(authenticate);

router.get("/analytics/overview", getOverviewHandler);
router.get("/analytics/posts/:postId/views", getPostViewsHandler);

export default router;
