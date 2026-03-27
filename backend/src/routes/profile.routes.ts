import { Router } from "express";
import {
  checkUsernameHandler,
  updateProfileHandler,
  replaceLinksHandler,
  getMyProfileHandler,
  getPublicProfileHandler,
} from "../controllers/profile.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  usernameAvailabilityQuery,
  updateProfileBody,
  replaceLinksBody,
} from "../validators/profile.validators.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get(
  "/username-availability",
  authenticate,
  validate({ query: usernameAvailabilityQuery }),
  checkUsernameHandler
);

router.get("/me", authenticate, getMyProfileHandler);

router.patch(
  "/me",
  authenticate,
  validate({ body: updateProfileBody }),
  updateProfileHandler
);

router.put(
  "/me/links",
  authenticate,
  validate({ body: replaceLinksBody }),
  replaceLinksHandler
);

router.get("/:username", getPublicProfileHandler);

export default router;
