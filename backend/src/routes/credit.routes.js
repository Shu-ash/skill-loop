import express from "express";
import { getMyCreditLedger } from "../controllers/credit.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my-ledger", protect, getMyCreditLedger);

export default router;
