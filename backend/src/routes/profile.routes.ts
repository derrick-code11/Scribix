import { Router } from "express";
import { getPublicProfileHandler } from "../controllers/profile.controller.js";

const router = Router();

router.get("/:username", getPublicProfileHandler);

export default router;
