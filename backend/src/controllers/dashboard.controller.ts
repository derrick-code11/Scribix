import type { Request, Response } from "express";
import * as analyticsService from "../services/analytics.service.js";
import { success } from "../lib/api-response.js";

export async function getOverviewHandler(req: Request, res: Response) {
  const range = (req.query.range as string) || "30d";
  const data = await analyticsService.getOverview(req.user!.userId, range);
  success(res, data);
}

export async function getPostViewsHandler(req: Request, res: Response) {
  const range = (req.query.range as string) || "30d";
  const source = (req.query.source as string) || "all";
  const data = await analyticsService.getPostViews(
    req.user!.userId,
    req.params.postId as string,
    range,
    source
  );
  success(res, data);
}
