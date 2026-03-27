import type { Request, Response } from "express";
import * as postService from "../services/post.service.js";
import { success } from "../lib/api-response.js";
import type {
  CreatePostInput,
  ListPostsInput,
  UpdatePostInput,
  SetSlugInput,
} from "../validators/post.validators.js";

export async function createPostHandler(req: Request, res: Response) {
  const post = await postService.createDraft(
    req.user!.userId,
    req.body as CreatePostInput
  );
  success(res, post, "Draft created", 201);
}

export async function listPostsHandler(req: Request, res: Response) {
  const data = await postService.listOwnerPosts(
    req.user!.userId,
    req.query as unknown as ListPostsInput
  );
  success(res, data);
}

export async function getPostHandler(req: Request, res: Response) {
  const post = await postService.getPostForEditor(
    req.user!.userId,
    req.params.postId as string
  );
  success(res, post);
}

export async function updatePostHandler(req: Request, res: Response) {
  const post = await postService.updatePost(
    req.user!.userId,
    req.params.postId as string,
    req.body as UpdatePostInput
  );
  success(res, post, "Post updated");
}

export async function setSlugHandler(req: Request, res: Response) {
  const post = await postService.setSlug(
    req.user!.userId,
    req.params.postId as string,
    (req.body as SetSlugInput).slug
  );
  success(res, post, "Slug updated");
}

export async function publishHandler(req: Request, res: Response) {
  const post = await postService.publish(
    req.user!.userId,
    req.params.postId as string
  );
  success(res, post, "Post published");
}

export async function unpublishHandler(req: Request, res: Response) {
  const post = await postService.unpublish(
    req.user!.userId,
    req.params.postId as string
  );
  success(res, post, "Post unpublished");
}

export async function deletePostHandler(req: Request, res: Response) {
  await postService.softDelete(
    req.user!.userId,
    req.params.postId as string
  );
  success(res, null, "Post deleted");
}

export async function restorePostHandler(req: Request, res: Response) {
  const post = await postService.restore(
    req.user!.userId,
    req.params.postId as string
  );
  success(res, post, "Post restored");
}
