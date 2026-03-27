import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { uploadUrlHandler, registerMediaHandler } from "../controllers/media.controller.js";

const router = Router();

router.post("/upload-url", requireAuth, uploadUrlHandler);
router.post("/", requireAuth, registerMediaHandler);

export default router;
