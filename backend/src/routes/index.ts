import { Router } from "express";
import healthRoutes from "./health.routes.js";
import profileRoutes from "./profile.routes.js";
import publicRoutes from "./public.routes.js";
import embedRoutes from "./embed.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/profiles", profileRoutes);
router.use("/public", publicRoutes);
router.use("/embed", embedRoutes);

export default router;
