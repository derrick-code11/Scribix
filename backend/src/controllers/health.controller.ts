import type { Request, Response } from "express";
import { success } from "../lib/api-response.js";

export function getHealth(_req: Request, res: Response) {
  success(res, { status: "ok", timestamp: new Date().toISOString() });
}
