import rateLimit from "express-rate-limit";

export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    data: null,
    error: { code: "RATE_LIMITED" },
    message: "Too many requests, please try again later",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    data: null,
    error: { code: "RATE_LIMITED" },
    message: "Too many auth attempts, please try again later",
  },
});

export const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    data: null,
    error: { code: "RATE_LIMITED" },
    message: "Too many requests",
  },
});

export const embedLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    data: null,
    error: { code: "RATE_LIMITED" },
    message: "Too many embed requests",
  },
});
