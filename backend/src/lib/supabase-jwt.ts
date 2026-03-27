import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface SupabaseAccessPayload {
  sub: string;
  email?: string;
  role?: string;
  aud?: string | string[];
}

export function verifySupabaseAccessToken(token: string): SupabaseAccessPayload {
  const payload = jwt.verify(token, env.supabaseJwtSecret, {
    algorithms: ["HS256"],
    audience: "authenticated",
  }) as SupabaseAccessPayload;

  if (!payload.sub) {
    throw new Error("Invalid token: missing sub");
  }

  return payload;
}
