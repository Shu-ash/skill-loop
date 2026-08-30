import express from "express";
import { protectAdmin } from "../middleware/admin.middleware.js";
import {
  getAdminMetrics,
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
  updateUserPasswordByAdmin,
  getAdminSessions,
  resolveSessionDispute,
  getAdminCreditsLedger,
  getAdminCategories,
  createCategory,
  deleteCategory,
  getAdminReports,
  resolveReport
} from "../controllers/admin.controller.js";

const router = express.Router();

// Apply protectAdmin middleware to all admin endpoints
router.use(protectAdmin);

// KPI Metrics
router.get("/metrics", getAdminMetrics);

// User Management & Role/Status/Password Control
router.get("/users", getAdminUsers);
router.patch("/users/:userId/role", updateUserRole);
router.patch("/users/:userId/status", updateUserStatus);
router.patch("/users/:userId/password", updateUserPasswordByAdmin);

// Session Monitoring & Dispute Resolution
router.get("/sessions", getAdminSessions);
router.patch("/sessions/:sessionId/dispute", resolveSessionDispute);

// Credit Audit Ledger
router.get("/credits", getAdminCreditsLedger);

// Skill Categories
router.get("/categories", getAdminCategories);
router.post("/categories", createCategory);
router.delete("/categories/:id", deleteCategory);

// Moderation Reports Queue
router.get("/reports", getAdminReports);
router.patch("/reports/:reportId/resolve", resolveReport);

export default router;
