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
      const result = schema.query.safeParse(req.query);
      if (!result.success) {
        errors.query = formatZodError(result.error);
      } else {
        (req as any).query = result.data;
      }
    }

    if (schema.params) {
      const result = schema.params.safeParse(req.params);
      if (!result.success) {
        errors.params = formatZodError(result.error);
      } else {
        (req as any).params = result.data;
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
