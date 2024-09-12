import express from "express";
import {
  serverCreate,
  viewServers,
  viewBatchData,
  updateVlessServer,
} from "../controllers/serverManagment.controller.js";

const router = express.Router();

router.post("/", serverCreate);
router.get("/", viewServers);
router.get("/:id", viewBatchData);
router.patch("/:id/vlessServers/:vlessServerId", updateVlessServer);

export default router;
