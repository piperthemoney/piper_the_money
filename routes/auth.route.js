import express from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  restrict,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", protect, restrict("superadmin"), signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
export default router;
