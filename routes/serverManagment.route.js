import express from "express";
import {
  serverCreate,
  viewServers,
  viewBatchData,
  updateVlessServer,
  getServerDataByBatch,
} from "../controllers/serverManagment.controller.js";
import { authenticateJWT } from "../controllers/regularUser.controller.js";

const router = express.Router();

router.post("/", serverCreate);
router.get("/batch", authenticateJWT, getServerDataByBatch);
router.get("/", viewServers);
router.get("/:id", viewBatchData);
router.patch("/:id/vlessServers/:vlessServerId", updateVlessServer);

export default router;
