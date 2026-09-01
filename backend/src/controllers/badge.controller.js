// src/controllers/badge.controller.js
import Badge from "../models/badge.js";
import UserBadge from "../models/userBadge.js";

/**
 * GET /api/badges
 * List all available achievement badges
 */
export const getAllBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find({ status: "Active" }).sort({ createdAt: 1 }).lean();

    return res.status(200).json({
      success: true,
      data: { badges }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/badges/user/:userId
 * Get badges earned by a user
 */
export const getUserBadges = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userBadges = await UserBadge.find({ user: userId })
      .populate("badge")
      .sort({ awardedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        badges: userBadges.map((ub) => ({
          ...ub.badge,
          awardedAt: ub.awardedAt,
          reason: ub.reason
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/badges/me
 * Get logged-in user's earned badges
 */
export const getMyBadges = async (req, res, next) => {
  try {
    const userBadges = await UserBadge.find({ user: req.user._id })
      .populate("badge")
      .sort({ awardedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        badges: userBadges.map((ub) => ({
          ...ub.badge,
          awardedAt: ub.awardedAt,
          reason: ub.reason
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};
