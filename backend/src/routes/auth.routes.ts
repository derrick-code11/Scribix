import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getMeHandler, deleteMeHandler } from "../controllers/auth.controller.js";

const router = Router();

router.get("/me", requireAuth, getMeHandler);
router.delete("/me", requireAuth, deleteMeHandler);

export default router;
