import express from "express";
import {
  serverCreate,
  viewBatchData,
  updateVlessServer,
  pushServer,
  serversStatus,
  viewBatchDataOverview,
} from "../controllers/serverManagment.controller.js";

const router = express.Router();

router.post("/", serverCreate);
router.post("/:serverId", pushServer);
router.get("/batch", viewBatchDataOverview);
router.get("/", serversStatus);
router.get("/:id", viewBatchData);
router.patch("/:id/vlessServers/:vlessServerId", updateVlessServer);

export default router;
