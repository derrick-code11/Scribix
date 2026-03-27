import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  getPublicProfileHandler,
  usernameAvailabilityHandler,
  upsertProfileHandler,
  getOwnProfileHandler,
} from "../controllers/profile.controller.js";

const router = Router();

router.get("/username-availability", requireAuth, usernameAvailabilityHandler);
router.get("/me", requireAuth, getOwnProfileHandler);
router.patch("/me", requireAuth, upsertProfileHandler);
router.get("/:username", getPublicProfileHandler);

export default router;
