import type { Request, Response } from "express";
import * as publicService from "../services/public.service.js";
import { success } from "../lib/api-response.js";

export async function getEmbedPostsHandler(req: Request, res: Response) {
  const data = await publicService.getEmbedFeed(
    req.params.username as string,
    req.query.limit as string | undefined
  );
  success(res, data);
}
