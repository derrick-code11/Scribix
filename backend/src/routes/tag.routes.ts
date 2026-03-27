import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { searchTagsHandler } from "../controllers/tag.controller.js";

const router = Router();

router.get("/", requireAuth, searchTagsHandler);

export default router;
