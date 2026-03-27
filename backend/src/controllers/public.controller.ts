import type { Request, Response } from "express";
import * as publicService from "../services/public.service.js";
import { trackView } from "../services/analytics.service.js";
import { success } from "../lib/api-response.js";

export async function getPublicPostsHandler(req: Request, res: Response) {
  const data = await publicService.getPublicPostFeed(
    req.params.username as string,
    req.query as Record<string, string>
  );
  success(res, data);
}

export async function getPublicPostDetailHandler(req: Request, res: Response) {
  const data = await publicService.getPublicPostDetail(
    req.params.username as string,
    req.params.slug as string
  );

  const source = (req.query.source as string) || "post";
  trackView(data.post.id, source).catch(() => {});

  success(res, data);
}
