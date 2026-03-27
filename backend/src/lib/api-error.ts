export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(code: string, message: string, details?: Record<string, unknown>) {
    return new AppError(400, code, message, details);
  }

  static unauthorized(message = "Authentication required") {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "Access denied") {
    return new AppError(403, "FORBIDDEN", message);
  }

  static notFound(resource = "Resource") {
    return new AppError(404, "NOT_FOUND", `${resource} not found`);
  }

  static conflict(code: string, message: string, details?: Record<string, unknown>) {
    return new AppError(409, code, message, details);
  }

  static unprocessable(code: string, message: string, details?: Record<string, unknown>) {
    return new AppError(422, code, message, details);
  }

  static tooMany(message = "Too many requests") {
    return new AppError(429, "RATE_LIMITED", message);
  }
}
