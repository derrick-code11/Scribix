export class ApiError extends Error {
  readonly code: string | undefined;
  readonly status: number;

  constructor(message: string, code: string | undefined, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}
