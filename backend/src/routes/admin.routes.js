import express from "express";
import { protectAdmin } from "../middleware/admin.middleware.js";
import {
  getAdminMetrics,
  getAdminUsers,
  updateUserRole,
  getAdminSessions,
  resolveSessionDispute,
  getAdminCreditsLedger,
  getAdminCategories,
  getAdminReports
} from "../controllers/admin.controller.js";

const router = express.Router();

// Apply protectAdmin middleware to all admin endpoints
router.use(protectAdmin);

// Admin KPI metrics
router.get("/metrics", getAdminMetrics);

// User management
router.get("/users", getAdminUsers);
router.patch("/users/:userId/role", updateUserRole);

// Session monitoring & dispute resolution
router.get("/sessions", getAdminSessions);
router.patch("/sessions/:sessionId/dispute", resolveSessionDispute);

// Audit & Categories
router.get("/credits", getAdminCreditsLedger);
router.get("/categories", getAdminCategories);
router.get("/reports", getAdminReports);

export default router;
