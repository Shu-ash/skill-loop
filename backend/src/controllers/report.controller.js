// Backend/src/controllers/report.controller.js
import Report from "../models/report.js";
import Session from "../models/session.js";
import User from "../models/user.js";

/**
 * POST /api/reports
 * Submit a report or session dispute
 */
export const createReport = async (req, res, next) => {
  try {
    const { reportedUserId, sessionId, reason, details } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "A reason is required to submit a report."
      });
    }

    let finalReportedUserId = reportedUserId;

    // If session ID provided, automatically look up partner and attach session
    if (sessionId) {
      const session = await Session.findById(sessionId);
      if (session) {
        if (!finalReportedUserId) {
          const isTeacher = String(session.teacher) === String(req.user._id);
          finalReportedUserId = isTeacher ? session.learner : session.teacher;
        }
      }
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser: finalReportedUserId || null,
      reportedSession: sessionId || null,
      reason: reason.trim(),
      details: details ? details.trim() : "",
      status: "pending"
    });

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully. Our team will review this incident promptly.",
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/my-reports
 * Get user's submitted reports and status
 */
export const getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate("reportedUser", "name firstName lastName username")
      .populate("reportedSession", "skill topic scheduledAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { reports }
    });
  } catch (error) {
    next(error);
  }
};
