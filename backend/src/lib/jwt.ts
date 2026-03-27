import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

interface TokenPayload {
  userId: string;
}

export function signAccessToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as any,
  };
  return jwt.sign({ userId } satisfies TokenPayload, env.jwtSecret, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}
