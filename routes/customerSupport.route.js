import express from "express";
import {
  createCustomerSupport,
  pushCustomerSupportData,
  getCustomerSupportData,
} from "../controllers/customerSupport.controller.js";

const router = express.Router();

router.post("/", createCustomerSupport);
router.post("/:guideId", pushCustomerSupportData);
router.get("/", getCustomerSupportData);

export default router;
