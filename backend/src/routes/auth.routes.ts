import { Router } from "express";
import { getMeHandler } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/me", authenticate, getMeHandler);

export default router;
