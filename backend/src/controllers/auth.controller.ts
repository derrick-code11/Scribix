import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { success } from "../lib/api-response.js";
import type { SignupInput, LoginInput } from "../validators/auth.validators.js";

export async function signupHandler(req: Request, res: Response) {
  const result = await authService.signup(req.body as SignupInput);
  success(res, result, "Account created", 201);
}

export async function loginHandler(req: Request, res: Response) {
  const result = await authService.login(req.body as LoginInput);
  success(res, result, "Login successful");
}

export async function getMeHandler(req: Request, res: Response) {
  const data = await authService.getMe(req.user!.userId);
  success(res, data, "Authenticated user loaded");
}
