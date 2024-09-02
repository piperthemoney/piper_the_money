import express from "express";
import {
  createRegularUser,
  activateCode,
  getAllCodeStatuses,
  authenticateJWT,
} from "../controllers/regularUser.controller.js";

const router = express.Router();

router.post("/", createRegularUser);
router.post("/activation", activateCode);
router.get("/", getAllCodeStatuses);
export default router;
