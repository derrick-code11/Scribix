import { Router } from "express";
import { searchTagsHandler } from "../controllers/tag.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticate, searchTagsHandler);

export default router;
