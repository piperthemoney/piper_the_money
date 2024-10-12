import express from "express";
import {
  createPreAppVersion,
  retrivedPreVersionControl,
  updatePreVersionControlData,
} from "../controllers/preVersion.controller.js";

const router = express.Router();

router.post("/", createPreAppVersion);
router.get("/", retrivedPreVersionControl);
router.patch("/:id", updatePreVersionControlData);

export default router;
