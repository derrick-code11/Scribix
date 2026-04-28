import type { Request, Response } from "express";
import * as publicService from "../services/public.service.js";
import { success } from "../lib/api-response.js";
import { getEmbedSdkScript } from "../embed/sdk-script.js";
import { env } from "../config/env.js";

function getSiteOrigin(req: Request): string | undefined {
  if (env.publicAppUrl.trim()) return env.publicAppUrl.trim();
  const forwardedProto = req.get("x-forwarded-proto");
  const proto = forwardedProto ? forwardedProto.split(",")[0].trim() : req.protocol;
  const host = req.get("host");
  if (!host) return undefined;
  return `${proto}://${host}`;
}

export async function getEmbedPostsHandler(req: Request, res: Response) {
  const data = await publicService.getEmbedFeed(
    req.params.username as string,
    {
      limit: req.query.limit as string | undefined,
      offset: req.query.offset as string | undefined,
    },
    { siteOrigin: getSiteOrigin(req) }
  );
  success(res, data);
}

export function getEmbedSdkHandler(_req: Request, res: Response) {
  res.type("application/javascript; charset=utf-8");
  res.send(getEmbedSdkScript());
}
