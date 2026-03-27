import type { Request, Response } from "express";
import { searchTags } from "../services/tag.service.js";
import { success } from "../lib/api-response.js";

export async function searchTagsHandler(req: Request, res: Response) {
  const tags = await searchTags(req.query.query as string | undefined);
  success(res, { tags });
}
