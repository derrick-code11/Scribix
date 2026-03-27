import { Router } from "express";
import { signupHandler, loginHandler, getMeHandler } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { signupBody, loginBody } from "../validators/auth.validators.js";
import { authenticate } from "../middlewares/auth.js";
import { authLimiter } from "../middlewares/rate-limit.js";

const router = Router();

router.post("/signup", authLimiter, validate({ body: signupBody }), signupHandler);
router.post("/login", authLimiter, validate({ body: loginBody }), loginHandler);
router.get("/me", authenticate, getMeHandler);

export default router;
