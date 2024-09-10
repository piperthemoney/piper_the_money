import express from "express";
import { monitoringData } from "../controllers/monitor.controller.js";
const router = express.Router();

router.get("/" , monitoringData);
export default router;
