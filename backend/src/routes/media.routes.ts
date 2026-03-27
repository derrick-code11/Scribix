import { Router } from "express";
import {
  getUploadUrlHandler,
  registerMediaHandler,
  deleteMediaHandler,
} from "../controllers/media.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  uploadUrlBody,
  registerMediaBody,
  mediaIdParams,
} from "../validators/media.validators.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.use(authenticate);

router.post("/upload-url", validate({ body: uploadUrlBody }), getUploadUrlHandler);
router.post("/", validate({ body: registerMediaBody }), registerMediaHandler);
router.delete("/:mediaId", validate({ params: mediaIdParams }), deleteMediaHandler);

export default router;
