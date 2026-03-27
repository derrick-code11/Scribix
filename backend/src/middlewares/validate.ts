import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { error } from "../lib/api-response.js";

interface ValidationTarget {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schema: ValidationTarget) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, unknown> = {};

    if (schema.body) {
      const result = schema.body.safeParse(req.body);
      if (!result.success) {
        errors.body = formatZodError(result.error);
      } else {
        req.body = result.data;
      }
    }

    if (schema.query) {
      const result = schema.query.safeParse(plainQuery(req));
      if (!result.success) {
        errors.query = formatZodError(result.error);
      } else {
        req.validatedQuery = result.data;
      }
    }

    if (schema.params) {
      const result = schema.params.safeParse(plainParams(req));
      if (!result.success) {
        errors.params = formatZodError(result.error);
      } else {
        req.validatedParams = result.data;
      }
    }

    if (Object.keys(errors).length > 0) {
      return error(res, 400, "VALIDATION_ERROR", "Invalid request data", errors);
    }

    next();
  };
}

function formatZodError(err: ZodError) {
  return err.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

/** Express 5 `req.query` can be a non-plain object; Zod expects plain data. */
function plainQuery(req: Request): Record<string, unknown> {
  const q = req.query;
  if (!q || typeof q !== "object") return {};
  return Object.fromEntries(
    Object.entries(q as Record<string, unknown>).map(([k, v]) => [
      k,
      Array.isArray(v) ? v[0] : v,
    ])
  );
}

function plainParams(req: Request): Record<string, unknown> {
  const p = req.params;
  if (!p || typeof p !== "object") return {};
  return { ...p };
}
