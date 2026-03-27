import type { Request, Response, NextFunction } from "express";
import { z } from "zod/v4";
import * as postService from "../services/post.service.js";
import { resolveLocalUserId } from "../services/auth.service.js";
import { success } from "../lib/api-response.js";
import { AppError } from "../lib/api-error.js";

const createPostSchema = z.object({
  title: z.string().min(1).max(300).default("Untitled"),
});

export async function createPostHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createPostSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.badRequest("VALIDATION_ERROR", "Invalid body", {
        issues: parsed.error.issues,
      });
    }
    const userId = await resolveLocalUserId(req.auth!.sub);
    const data = await postService.createPost(userId, parsed.data.title);
    success(res, data, "Draft created", 201);
  } catch (err) {
    next(err);
  }
}

export async function listPostsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = await resolveLocalUserId(req.auth!.sub);
    const data = await postService.listOwnPosts(userId, {
      status: req.query.status as string | undefined,
      q: req.query.q as string | undefined,
      tag: req.query.tag as string | undefined,
      sort: req.query.sort as string | undefined,
      order: req.query.order as string | undefined,
      cursor: req.query.cursor as string | undefined,
      limit: req.query.limit as string | undefined,
      include_deleted: req.query.include_deleted as string | undefined,
    });
    success(res, data);
  } catch (err) {
    next(err);
  }
}

export async function getPostHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = await resolveLocalUserId(req.auth!.sub);
    const data = await postService.getOwnPost(userId, req.params.postId as string);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

const updatePostSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content_json: z.any().optional(),
  content_text: z.string().nullable().optional(),
  excerpt: z.string().max(500).nullable().optional(),
  cover_media_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().min(1).max(60)).max(10).optional(),
});

export async function updatePostHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = updatePostSchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.badRequest("VALIDATION_ERROR", "Invalid body", {
        issues: parsed.error.issues,
      });
    }
    const userId = await resolveLocalUserId(req.auth!.sub);
    const data = await postService.updatePost(
      userId,
      req.params.postId as string,
      parsed.data,
    );
    success(res, data, "Post updated");
  } catch (err) {
    next(err);
  }
}

export async function publishPostHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = await resolveLocalUserId(req.auth!.sub);
    const data = await postService.publishPost(userId, req.params.postId as string);
    success(res, data, "Post published");
  } catch (err) {
    next(err);
  }
}

export async function unpublishPostHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = await resolveLocalUserId(req.auth!.sub);
    const data = await postService.unpublishPost(
      userId,
      req.params.postId as string,
    );
    success(res, data, "Post unpublished");
  } catch (err) {
    next(err);
  }
}

export async function deletePostHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = await resolveLocalUserId(req.auth!.sub);
    const data = await postService.softDeletePost(
      userId,
      req.params.postId as string,
    );
    success(res, data, "Post deleted");
  } catch (err) {
    next(err);
  }
}

export async function restorePostHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = await resolveLocalUserId(req.auth!.sub);
    const data = await postService.restorePost(
      userId,
      req.params.postId as string,
    );
    success(res, data, "Post restored");
  } catch (err) {
    next(err);
  }
}
