// src/controllers/badge.controller.js
import Badge from "../models/badge.js";
import UserBadge from "../models/userBadge.js";
import User from "../models/user.js";
import Session from "../models/session.js";
import SwapRequest from "../models/swapRequest.js";

const DEFAULT_BADGES = [
  {
    code: "early_adopter",
    name: "Early Adopter 🚀",
    icon: "🚀",
    description: "Joined SkillLoop and completed their skill profile.",
    criteria: "Complete your SkillLoop onboarding profile.",
    category: "special",
    status: "Active"
  },
  {
    code: "first_swap",
    name: "First Swap 🎉",
    icon: "🎉",
    description: "Successfully completed their very first skill swap session.",
    criteria: "Complete 1 skill swap session.",
    category: "community",
    status: "Active"
  },
  {
    code: "top_mentor",
    name: "Top Mentor 🏆",
    icon: "🏆",
    description: "Taught community sessions with high student ratings.",
    criteria: "Teach sessions with a 4.5+ star rating.",
    category: "teaching",
    status: "Active"
  },
  {
    code: "curious_learner",
    name: "Curious Learner 🧠",
    icon: "🧠",
    description: "Dedicated learner actively acquiring new skills from peers.",
    criteria: "Complete learning sessions on SkillLoop.",
    category: "learning",
    status: "Active"
  },
  {
    code: "speedy_responder",
    name: "Quick Responder ⚡",
    icon: "⚡",
    description: "Actively accepts and schedules community skill swap requests.",
    criteria: "Accept and schedule incoming swap requests.",
    category: "community",
    status: "Active"
  }
];

let badgesSeeded = false;

export const ensureDefaultBadges = async () => {
  if (badgesSeeded) return;
  try {
    const count = await Badge.countDocuments();
    if (count < DEFAULT_BADGES.length) {
      for (const b of DEFAULT_BADGES) {
        await Badge.findOneAndUpdate(
          { code: b.code },
          { $setOnInsert: b },
          { upsert: true, new: true }
        );
      }
    }
    badgesSeeded = true;
  } catch (err) {
    console.error("Failed to ensure default badges:", err);
  }
};

/**
 * Automatically evaluates a user's real MongoDB milestones and awards any unlocked badges.
 */
export const evaluateAndSyncUserBadges = async (userId) => {
  if (!userId) return [];
  try {
    await ensureDefaultBadges();

    const [user, allBadges, taughtCount, learnedCount, acceptedRequestsCount] = await Promise.all([
      User.findById(userId).select("onboardingCompleted skillsCanTeach rating ratingCount").lean(),
      Badge.find({ status: "Active" }).lean(),
      Session.countDocuments({ teacher: userId, status: "completed" }),
      Session.countDocuments({ learner: userId, status: "completed" }),
      SwapRequest.countDocuments({ receiver: userId, status: "accepted" })
    ]);

    if (!user) return [];

    const badgeByCode = new Map(allBadges.map((b) => [b.code, b]));
    const unlockedCodes = [];

    // 1. Early Adopter: Has profile or skills set
    if (user.onboardingCompleted || (Array.isArray(user.skillsCanTeach) && user.skillsCanTeach.length > 0)) {
      unlockedCodes.push({ code: "early_adopter", reason: "Completed SkillLoop skill profile" });
    }

    // 2. First Swap: Completed at least 1 session (taught or learned)
    if (taughtCount + learnedCount >= 1) {
      unlockedCodes.push({ code: "first_swap", reason: "Completed first skill swap session" });
    }

    // 3. Top Mentor: Taught at least 1 session with rating >= 4.5 (or taught >= 3 sessions)
    if (taughtCount >= 3 || (taughtCount >= 1 && (user.rating || 5.0) >= 4.5)) {
      unlockedCodes.push({ code: "top_mentor", reason: `Taught ${taughtCount} session(s) as a high-rated mentor` });
    }

    // 4. Curious Learner: Completed at least 1 learning session
    if (learnedCount >= 1) {
      unlockedCodes.push({ code: "curious_learner", reason: `Completed ${learnedCount} learning session(s)` });
    }

    // 5. Quick Responder: Accepted at least 1 incoming swap request
    if (acceptedRequestsCount >= 1) {
      unlockedCodes.push({ code: "speedy_responder", reason: "Accepted & scheduled community swap requests" });
    }

    for (const item of unlockedCodes) {
      const badgeDoc = badgeByCode.get(item.code);
      if (badgeDoc) {
        await UserBadge.findOneAndUpdate(
          { user: userId, badge: badgeDoc._id },
          {
            $setOnInsert: {
              user: userId,
              badge: badgeDoc._id,
              awardedAt: new Date(),
              reason: item.reason
            }
          },
          { upsert: true, new: true }
        );
      }
    }

    const userBadges = await UserBadge.find({ user: userId })
      .populate("badge")
      .sort({ awardedAt: -1 })
      .lean();

    return userBadges
      .filter((ub) => ub.badge)
      .map((ub) => ({
        ...ub.badge,
        awardedAt: ub.awardedAt,
        reason: ub.reason
      }));
  } catch (err) {
    console.error("Error evaluating user badges:", err);
    return [];
  }
};

/**
 * GET /api/badges
 * List all available achievement badges
 */
export const getAllBadges = async (req, res, next) => {
  try {
    await ensureDefaultBadges();
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
    const badges = await evaluateAndSyncUserBadges(userId);

    return res.status(200).json({
      success: true,
      data: { badges }
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
    const badges = await evaluateAndSyncUserBadges(req.user._id);

    return res.status(200).json({
      success: true,
      data: { badges }
    });
  } catch (error) {
    next(error);
  }
};
