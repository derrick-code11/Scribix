import { Router } from "express";
import {
  createPostHandler,
  listPostsHandler,
  getPostHandler,
  updatePostHandler,
  setSlugHandler,
  publishHandler,
  unpublishHandler,
  deletePostHandler,
  restorePostHandler,
} from "../controllers/post.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createPostBody,
  listPostsQuery,
  updatePostBody,
  setSlugBody,
  postIdParams,
} from "../validators/post.validators.js";
import { authenticate } from "../middlewares/auth.js";
import { requireOnboarding } from "../middlewares/require-onboarding.js";

const router = Router();

router.use(authenticate, requireOnboarding);

router.post("/", validate({ body: createPostBody }), createPostHandler);
router.get("/", validate({ query: listPostsQuery }), listPostsHandler);

router.get("/:postId", validate({ params: postIdParams }), getPostHandler);
router.patch(
  "/:postId",
  validate({ params: postIdParams, body: updatePostBody }),
  updatePostHandler
);
router.patch(
  "/:postId/slug",
  validate({ params: postIdParams, body: setSlugBody }),
  setSlugHandler
);
router.post(
  "/:postId/publish",
  validate({ params: postIdParams }),
  publishHandler
);
router.post(
  "/:postId/unpublish",
  validate({ params: postIdParams }),
  unpublishHandler
);
router.delete(
  "/:postId",
  validate({ params: postIdParams }),
  deletePostHandler
);
router.post(
  "/:postId/restore",
  validate({ params: postIdParams }),
  restorePostHandler
);

export default router;
