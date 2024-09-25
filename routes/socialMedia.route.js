import express from "express";
import { createSocialMedia } from "../controllers/socialMedia.controller.js";

const router = express.Router();

router.post("/", createSocialMedia);

export default router;
