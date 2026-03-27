import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getMeHandler } from "../controllers/auth.controller.js";

const router = Router();

router.get("/me", requireAuth, getMeHandler);

export default router;
