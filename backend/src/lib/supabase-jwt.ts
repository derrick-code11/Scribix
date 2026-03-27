import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../config/env.js";

export interface SupabaseAccessPayload {
  sub: string;
  email?: string;
  role?: string;
  aud?: string | string[];
}

const issuerBase = env.supabaseUrl.replace(/\/$/, "");
const issuer = `${issuerBase}/auth/v1`;

const JWKS = createRemoteJWKSet(
  new URL(`${issuer}/.well-known/jwks.json`)
);

export async function verifySupabaseAccessToken(
  token: string
): Promise<SupabaseAccessPayload> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer,
    audience: "authenticated",
  });

  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Invalid token: missing sub");
  }

  return payload as SupabaseAccessPayload;
}
