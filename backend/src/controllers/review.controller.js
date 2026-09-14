import Review from "../models/review.js";
import Session from "../models/session.js";
import User from "../models/user.js";

/**
 * POST /api/reviews
 * Submit a review for a completed session
 */
export const createReview = async (req, res, next) => {
    try {
        const { sessionId, rating, comment } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "Session ID is required"
            });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        if (session.status !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Can only review completed sessions"
            });
        }

        const userId = req.user._id.toString();
        const teacherId = session.teacher.toString();
        const learnerId = session.learner.toString();

        if (userId !== teacherId && userId !== learnerId) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this session"
            });
        }

        const existingReview = await Review.findOne({
            session: sessionId,
            reviewer: req.user._id
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this session"
            });
        }

        const isTeacher = userId === teacherId;
        const revieweeId = isTeacher ? session.learner : session.teacher;

        const review = await Review.create({
            session: sessionId,
            reviewer: req.user._id,
            reviewee: revieweeId,
            rating: Number(rating),
            comment: comment?.trim() || "",
            skill: session.skill || "Skill Swap",
            role: isTeacher ? "teacher" : "learner"
        });

        // Recalculate reviewee's average rating and ratingCount
        const allReviewsForReviewee = await Review.find({ reviewee: revieweeId });
        const totalRating = allReviewsForReviewee.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
        const avgRating = allReviewsForReviewee.length > 0 ? totalRating / allReviewsForReviewee.length : 5.0;

        await User.findByIdAndUpdate(revieweeId, {
            rating: Math.round(avgRating * 10) / 10,
            ratingCount: allReviewsForReviewee.length
        });

        return res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: { review }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/reviews/session/:sessionId
 * Check if current user already reviewed a session
 */
export const getSessionReview = async (req, res, next) => {
    try {
        const review = await Review.findOne({
            session: req.params.sessionId,
            reviewer: req.user._id
        });

        return res.status(200).json({
            success: true,
            data: {
                reviewed: Boolean(review),
                review: review || null
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/reviews/my-reviews
 * Fetch all reviews given to the logged-in user by other members
 */
export const getMyReceivedReviews = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const reviews = await Review.find({ reviewee: userId })
            .populate("reviewer", "name firstName lastName username profilePhotoUrl headline")
            .populate("session", "topic skill duration scheduledAt")
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;
        const totalRating = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
        const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : "5.0";

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            const stars = Math.min(5, Math.max(1, Math.round(r.rating)));
            if (distribution[stars] !== undefined) {
                distribution[stars]++;
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                reviews,
                totalReviews,
                averageRating: Number(averageRating),
                distribution
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/reviews/user/:userId
 * Fetch public reviews received by a specific user
 */
export const getUserReviews = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const reviews = await Review.find({ reviewee: userId })
            .populate("reviewer", "name firstName lastName username profilePhotoUrl headline")
            .populate("session", "topic skill duration scheduledAt")
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;
        const totalRating = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
        const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : "5.0";

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            const stars = Math.min(5, Math.max(1, Math.round(r.rating)));
            if (distribution[stars] !== undefined) {
                distribution[stars]++;
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                reviews,
                totalReviews,
                averageRating: Number(averageRating),
                distribution
            }
        });
    } catch (error) {
        next(error);
    }
};
