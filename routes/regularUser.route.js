import express from "express";
import {
  createRegularUser,
  activateCode,
  getOverViewStatus,
  authenticateJWT,
  getDetailStatus,
} from "../controllers/regularUser.controller.js";

const router = express.Router();

router.post("/", createRegularUser);
router.post("/activation", activateCode);
router.get("/", getOverViewStatus);
router.get("/:id", getDetailStatus);
export default router;
