import type { Response } from "express";

interface SuccessPayload<T> {
  data: T;
  error: null;
  message: string | null;
}

interface ErrorPayload {
  data: null;
  error: { code: string; details?: unknown };
  message: string;
}

export function success<T>(res: Response, data: T, message?: string, status = 200) {
  const body: SuccessPayload<T> = {
    data,
    error: null,
    message: message ?? null,
  };
  return res.status(status).json(body);
}

export function error(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  const body: ErrorPayload = {
    data: null,
    error: { code, ...(details !== undefined && { details }) },
    message,
  };
  return res.status(status).json(body);
}
