import type { Request, Response, NextFunction } from "express";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { env } from "../config/env.js";
import { AppError } from "../lib/api-error.js";

const jwks = createRemoteJWKSet(
  new URL(`${env.supabaseUrl}/auth/v1/.well-known/jwks.json`),
);

async function extractAndVerify(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice(7);
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `${env.supabaseUrl}/auth/v1`,
    audience: "authenticated",
  });

  const sub = payload.sub;
  const email = (payload.email as string) ?? "";
  if (!sub) return null;

  return { sub, email };
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const auth = await extractAndVerify(req);
    if (!auth) throw AppError.unauthorized();
    req.auth = auth;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(AppError.unauthorized("Invalid or expired token"));
  }
}
