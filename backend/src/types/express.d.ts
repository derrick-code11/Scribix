declare namespace Express {
  interface Request {
    auth?: {
      sub: string;
      email: string;
    };
  }
}
