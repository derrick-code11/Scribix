import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  createPostHandler,
  listPostsHandler,
  getPostHandler,
  updatePostHandler,
  publishPostHandler,
  unpublishPostHandler,
  deletePostHandler,
  restorePostHandler,
} from "../controllers/post.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", createPostHandler);
router.get("/", listPostsHandler);
router.get("/:postId", getPostHandler);
router.patch("/:postId", updatePostHandler);
router.post("/:postId/publish", publishPostHandler);
router.post("/:postId/unpublish", unpublishPostHandler);
router.delete("/:postId", deletePostHandler);
router.post("/:postId/restore", restorePostHandler);

export default router;
