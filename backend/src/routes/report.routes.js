import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createReport, getMyReports } from "../controllers/report.controller.js";

const router = express.Router();

router.use(protect);

router.post("/", createReport);
router.get("/my-reports", getMyReports);

export default router;
