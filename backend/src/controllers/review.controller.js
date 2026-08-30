// src/controllers/review.controller.js
import Review from "../models/review.js";
import Session from "../models/session.js";
import User from "../models/user.js";
import Notification from "../models/notification.js";
import Badge from "../models/badge.js";
import UserBadge from "../models/userBadge.js";

/**
 * POST /api/reviews
 * Submit a post-session review & rating
 */
export const createReview = async (req, res, next) => {
  try {
    const { sessionId, rating, comment, tags } = req.body;

    if (!sessionId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Session ID and rating are required"
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5"
      });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    // Check caller is either teacher or learner
    const userId = req.user._id.toString();
    const teacherId = session.teacher.toString();
    const learnerId = session.learner.toString();

    if (userId !== teacherId && userId !== learnerId) {
      return res.status(403).json({
        success: false,
        message: "You can only review sessions you participated in"
      });
    }

    const isReviewerTeacher = userId === teacherId;
    const revieweeId = isReviewerTeacher ? session.learner : session.teacher;

    // Check duplicate review
    const existingReview = await Review.findOne({
      session: session._id,
      reviewer: req.user._id
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this session"
      });
    }

    const review = await Review.create({
      session: session._id,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating: numRating,
      comment: comment?.trim() || "",
      tags: Array.isArray(tags) ? tags : [],
      skill: session.skill
    });

    // Recalculate reviewee average rating
    const allReviewsForUser = await Review.find({ reviewee: revieweeId });
    const totalScore = allReviewsForUser.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalScore / allReviewsForUser.length).toFixed(1));

    await User.findByIdAndUpdate(revieweeId, {
      rating: avgRating,
      ratingCount: allReviewsForUser.length
    });

    // Check and award badges
    try {
      // 1. First Swap Badge
      const firstSwapBadge = await Badge.findOne({ code: "first_swap" });
      if (firstSwapBadge) {
        await UserBadge.findOneAndUpdate(
          { user: revieweeId, badge: firstSwapBadge._id },
          { user: revieweeId, badge: firstSwapBadge._id, reason: "Completed first verified skill swap!" },
          { upsert: true }
        );
      }

      // 2. Top Mentor Badge (if taught 5+ with 4.8+ rating)
      if (allReviewsForUser.length >= 5 && avgRating >= 4.8) {
        const topMentorBadge = await Badge.findOne({ code: "top_mentor" });
        if (topMentorBadge) {
          await UserBadge.findOneAndUpdate(
            { user: revieweeId, badge: topMentorBadge._id },
            { user: revieweeId, badge: topMentorBadge._id, reason: "Achieved 4.8+ rating across 5+ classes!" },
            { upsert: true }
          );
        }
      }
    } catch (badgeErr) {
      console.error("Badge award check error:", badgeErr);
    }

    // Notification for reviewee
    const reviewerName = req.user.name || "A member";
    await Notification.create({
      user: revieweeId,
      title: `⭐ New ${numRating}-Star Review!`,
      text: `${reviewerName} left you a ${numRating}-star rating for your "${session.skill}" session.`,
      type: "system",
      link: "/profile"
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      data: { review }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/user/:userId
 * Get all reviews received by a user
 */
export const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewee: userId })
      .populate("reviewer", "name username profilePhotoUrl headline")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/session/:sessionId
 * Get reviews for a specific session
 */
export const getSessionReviews = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const reviews = await Review.find({ session: sessionId })
      .populate("reviewer", "name username profilePhotoUrl")
      .lean();

    return res.status(200).json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};
