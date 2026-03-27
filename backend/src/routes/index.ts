import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import mediaRoutes from "./media.routes.js";
import publicRoutes from "./public.routes.js";
import embedRoutes from "./embed.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/profiles", profileRoutes);
router.use("/media", mediaRoutes);
router.use("/public", publicRoutes);
router.use("/embed", embedRoutes);

export default router;
