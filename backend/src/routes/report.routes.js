// Backend/src/routes/report.routes.js
import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createReport, getMyReports } from "../controllers/report.controller.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createReport);
router.get("/my-reports", getMyReports);

export default router;
