import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { notFoundHandler, errorHandler } from "./middlewares/error.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
