import type { Request, Response, NextFunction } from "express";
import * as tagService from "../services/tag.service.js";
import { success } from "../lib/api-response.js";

export async function searchTagsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = req.query.query as string | undefined;
    const data = await tagService.searchTags(query);
    success(res, data);
  } catch (err) {
    next(err);
  }
}
