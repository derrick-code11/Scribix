declare global {
  namespace Express {
    interface Request {
      /** Set by `validate()` when a query Zod schema is used (Express 5 `req.query` is read-only). */
      validatedQuery?: unknown;
      /** Set by `validate()` when a params Zod schema is used (Express 5 `req.params` is read-only). */
      validatedParams?: unknown;
    }
  }
}

export {};
