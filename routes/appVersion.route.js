import express from "express";
import {
  createAppVersion,
  retrivedVersionControl,
  updateVersionControlData,
} from "../controllers/appVersion.controller.js";

const router = express.Router();

router.post("/", createAppVersion);
router.get("/", retrivedVersionControl);
router.patch("/:id", updateVersionControlData);

export default router;
