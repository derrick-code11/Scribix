import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { express5QueryCompat } from "./middlewares/express5-query-compat.js";
import { notFoundHandler, errorHandler } from "./middlewares/error.js";
import { standardLimiter } from "./middlewares/rate-limit.js";
import routes from "./routes/index.js";

const app = express();

app.use(express5QueryCompat);

const allowedOrigins = env.corsOrigin.split(",").map((o) => o.trim());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(standardLimiter);

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
