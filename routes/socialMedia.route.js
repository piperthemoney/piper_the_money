import express from "express";
import {
  createSocialMedia,
  pushPlatformData,
  getSocialMediaData,
} from "../controllers/socialMedia.controller.js";

const router = express.Router();

router.post("/", createSocialMedia);
router.post("/:guideId", pushPlatformData);
router.get("/", getSocialMediaData);

export default router;
