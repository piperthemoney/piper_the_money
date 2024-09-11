import express from "express";
import {
  createRegularUser,
  activateCode,
  getOverViewStatus,
  authenticateJWT,
  getDetailStatus,
  exportUserById,
} from "../controllers/regularUser.controller.js";

const router = express.Router();

router.post("/", createRegularUser);
router.post("/activation", activateCode);
router.get("/", getOverViewStatus);
router.get("/:id", getDetailStatus);
router.get("/export/:id", exportUserById);
export default router;
