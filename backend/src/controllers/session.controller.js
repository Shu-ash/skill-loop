import mongoose from "mongoose";
import Session from "../models/session.js";
import User from "../models/user.js";
import CreditLedger from "../models/creditLedger.js";
import Notification from "../models/notification.js";

/**
 * Automatically complete active sessions whose scheduled duration has passed
 * and automatically settle the credits (+1 Teacher, -1 Learner).
 */
/**
 * Settle a completed session as one MongoDB transaction. The session state,
 * learner debit, teacher credit and ledger entry either all commit or all roll back.
 */
const settleSessionCredits = async (sessionId, completedAt) => {
    const dbSession = await mongoose.startSession();
    let settledSession = null;
    try {
        await dbSession.withTransaction(async () => {
            settledSession = await Session.findOneAndUpdate(
                {
                    _id: sessionId,
                    status: { $in: ["scheduled", "in_progress"] },
                    learnerJoined: true,
                    teacherJoined: true
                },
                { $set: { status: "completed", completedAt } },
                { new: true, session: dbSession }
            );
            if (!settledSession) return;

            const learnerDebit = await User.findOneAndUpdate(
                { _id: settledSession.learner, credits: { $gte: 1 } },
                { $inc: { credits: -1 } },
                { new: true, session: dbSession }
            );
            if (!learnerDebit) {
                const error = new Error("The learner no longer has enough credits to settle this session.");
                error.code = "INSUFFICIENT_CREDITS";
                throw error;
            }

            const teacherCredit = await User.findByIdAndUpdate(
                settledSession.teacher,
                { $inc: { credits: 1 } },
                { new: true, session: dbSession }
            );
            if (!teacherCredit) throw new Error("Session teacher account was not found.");

            await CreditLedger.create([{
                sender: settledSession.learner,
                receiver: settledSession.teacher,
                session: settledSession._id,
                amount: 1,
                transactionType: "session_reward",
                description: `Skill Swap: ${settledSession.skill}`
            }], { session: dbSession });
        });
        return settledSession;
    } finally {
        await dbSession.endSession();
    }
};

const notifySessionSettlement = async (session) => {
    const teacherName = session.teacher?.name || "Teacher";
    const learnerName = session.learner?.name || "Learner";
    await Notification.insertMany([
        {
            user: session.teacher?._id || session.teacher,
            title: "🎉 +1 Skill Credit Earned!",
            text: `Session completed! You earned +1 credit for teaching ${session.skill} to ${learnerName}.`,
            type: "credit_earned",
            link: "/credits"
        },
        {
            user: session.learner?._id || session.learner,
            title: "🎓 Class Completed (-1 Credit)",
            text: `Completed ${session.skill} class with ${teacherName}. 1 credit deducted.`,
            type: "credit_spent",
            link: "/credits"
        }
    ]);
};

/**
 * Automatically complete active sessions whose scheduled duration has passed.
 * Credit settlement is transactional and safe against concurrent workers.
 */
export const autoCompleteExpiredSessions = async () => {
    try {
        if (mongoose.connection.readyState !== 1) return;

        const now = new Date();
        const activeSessions = await Session.find({
            status: { $in: ["scheduled", "in_progress"] },
            scheduledAt: { $ne: null },
            learnerJoined: true,
            teacherJoined: true
        }).populate("teacher learner");

        for (const session of activeSessions) {
            const durationMs = (Number(session.duration) || 45) * 60 * 1000;
            const sessionEnd = new Date(new Date(session.scheduledAt).getTime() + durationMs);
            if (now < sessionEnd) continue;

            try {
                const settled = await settleSessionCredits(session._id, sessionEnd);
                if (!settled) continue;
                await notifySessionSettlement(session);
            } catch (error) {
                if (error.code !== "INSUFFICIENT_CREDITS") {
                    console.error("Failed to settle expired session:", session._id, error);
                }
            }
        }
    } catch (err) {
        console.error("Error in autoCompleteExpiredSessions:", err);
    }
};

// Background interval to auto-check expired sessions every 15s
setInterval(() => {
    autoCompleteExpiredSessions().catch(() => {});
}, 15000);

/**
 * GET /api/sessions
 * Get sessions for logged-in user
 */
export const getMySessions = async (
    req,
    res,
    next
) => {
    try {
        await autoCompleteExpiredSessions();

        const sessions = await Session.find({
            $or: [
                {
                    teacher: req.user._id
                },
                {
                    learner: req.user._id
                }
            ]
        })
            .populate(
                "teacher",
                "firstName lastName name username profilePhotoUrl headline rating"
            )
            .populate(
                "learner",
                "firstName lastName name username profilePhotoUrl headline rating"
            )
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            data: {
                sessions
            }
        });
    } catch (error) {
        next(error);
    }
};


/**
 * GET /api/sessions/:sessionId
 * Get one session
 */
export const getSessionById = async (
    req,
    res,
    next
) => {
    try {
        const session = await Session.findOne({
            _id: req.params.sessionId,

            $or: [
                {
                    teacher: req.user._id
                },
                {
                    learner: req.user._id
                }
            ]
        })
            .populate(
                "teacher",
                "firstName lastName name username profilePhotoUrl headline rating"
            )
            .populate(
                "learner",
                "firstName lastName name username profilePhotoUrl headline rating"
            );

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                session
            }
        });
    } catch (error) {
        next(error);
    }
};


/**
 * PATCH /api/sessions/:sessionId/schedule
 * Schedule a session
 */
export const scheduleSession = async (
    req,
    res,
    next
) => {
    try {
        const {
            scheduledAt,
            mode,
            meetLink,
            duration
        } = req.body;

        // Validate Date

        if (!scheduledAt) {
            return res.status(400).json({
                success: false,
                message:
                    "Scheduled date and time are required"
            });
        }

        const parsedDate = new Date(
            scheduledAt
        );

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid scheduled date and time"
            });
        }

        const gracePeriod = new Date(Date.now() - 15 * 60 * 1000);
        if (
            parsedDate < gracePeriod
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Scheduled time must be in the present or future"
            });
        }

        // Validate Mode

        const selectedMode =
            mode || "online";

        const allowedModes = [
            "online",
            "in_person"
        ];

        if (
            !allowedModes.includes(
                selectedMode
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid session mode"
            });
        }

        // Validate Meet Link

        if (
            selectedMode === "online" &&
            (!meetLink ||
                !meetLink.trim())
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Meeting link is required for online sessions"
            });
        }

        // Validate Duration

        const selectedDuration =
            Number(duration ?? 45);

        const allowedDurations = [
            15,
            30,
            45,
            60,
            90,
            120
        ];

        if (
            !Number.isInteger(
                selectedDuration
            ) ||
            !allowedDurations.includes(
                selectedDuration
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Duration must be 15, 30, 45, 60, 90, or 120 minutes"
            });
        }

        // Find Session

        const session =
            await Session.findOne({
                _id:
                    req.params.sessionId,

                $or: [
                    {
                        teacher:
                            req.user._id
                    },
                    {
                        learner:
                            req.user._id
                    }
                ]
            });

        if (!session) {
            return res.status(404).json({
                success: false,
                message:
                    "Session not found"
            });
        }

        // Status Check

        if (
            session.status ===
            "completed"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot schedule a completed session"
            });
        }

        if (
            session.status ===
            "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot schedule a cancelled session"
            });
        }

        if (
            session.status ===
            "in_progress"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot schedule a session that is already in progress"
            });
        }

        // Save

        session.scheduledAt =
            parsedDate;

        session.mode =
            selectedMode;

        session.meetLink =
            selectedMode === "online"
                ? meetLink.trim()
                : "";

        session.duration =
            selectedDuration;

        session.status =
            "scheduled";

        await session.save();

        // Populate before response
        await session.populate([
            {
                path: "teacher",
                select:
                    "firstName lastName name username profilePhotoUrl headline rating"
            },
            {
                path: "learner",
                select:
                    "firstName lastName name username profilePhotoUrl headline rating"
            }
        ]);

        return res.status(200).json({
            success: true,

            message:
                "Session scheduled successfully",

            data: {
                session
            }
        });
    } catch (error) {
        next(error);
    }
};


/**
 * PATCH /api/sessions/:sessionId/join
 * Record participant joining the meeting
 */
export const joinSession = async (req, res, next) => {
    try {
        const session = await Session.findOne({
            _id: req.params.sessionId,
            $or: [
                { teacher: req.user._id },
                { learner: req.user._id }
            ]
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        const isTeacher = String(session.teacher) === String(req.user._id);
        const isLearner = String(session.learner) === String(req.user._id);

        if (isLearner) {
            session.learnerJoined = true;
            session.learnerJoinedAt = new Date();
            if (session.status === "scheduled") {
                session.status = "in_progress";
            }
        }

        if (isTeacher) {
            session.teacherJoined = true;
            session.teacherJoinedAt = new Date();
        }

        await session.save();

        await session.populate([
            {
                path: "teacher",
                select: "firstName lastName name username profilePhotoUrl headline rating credits"
            },
            {
                path: "learner",
                select: "firstName lastName name username profilePhotoUrl headline rating credits"
            }
        ]);

        return res.status(200).json({
            success: true,
            message: "Joined session",
            data: {
                session
            }
        });
    } catch (error) {
        next(error);
    }
};


/**
 * PATCH /api/sessions/:sessionId/start
 * Start a scheduled session
 */
export const startSession = async (
    req,
    res,
    next
) => {
    try {
        const session =
            await Session.findOne({
                _id:
                    req.params.sessionId,

                $or: [
                    {
                        teacher:
                            req.user._id
                    },
                    {
                        learner:
                            req.user._id
                    }
                ]
            });

        if (!session) {
            return res.status(404).json({
                success: false,
                message:
                    "Session not found"
            });
        }

        // Must be scheduled first
        if (
            session.status !==
            "scheduled"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Cannot start a ${session.status} session`
            });
        }

        // Must have a scheduled time
        if (!session.scheduledAt) {
            return res.status(400).json({
                success: false,
                message:
                    "Session has not been scheduled yet"
            });
        }

        session.status = "in_progress";
        await session.save();

        await session.populate([
            {
                path: "teacher",
                select:
                    "firstName lastName name username profilePhotoUrl headline rating"
            },
            {
                path: "learner",
                select:
                    "firstName lastName name username profilePhotoUrl headline rating"
            }
        ]);

        return res.status(200).json({
            success: true,

            message:
                "Session started",

            data: {
                session
            }
        });
    } catch (error) {
        next(error);
    }
};


/**
 * PATCH /api/sessions/:sessionId/complete
 * Complete a session
 */
export const completeSession = async (req, res, next) => {
    try {
        const session = await Session.findOne({
            _id: req.params.sessionId,
            $or: [{ teacher: req.user._id }, { learner: req.user._id }]
        }).populate("teacher learner");

        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }
        if (session.status === "completed") {
            return res.status(400).json({ success: false, message: "Session is already completed" });
        }
        if (session.status === "cancelled") {
            return res.status(400).json({ success: false, message: "Cancelled session cannot be completed" });
        }
        if (!["scheduled", "in_progress"].includes(session.status)) {
            return res.status(400).json({ success: false, message: "Session must be active before it can be completed" });
        }
        if (!session.learnerJoined || !session.teacherJoined) {
            return res.status(400).json({
                success: false,
                message: "Both teacher and learner must join before the session can be completed."
            });
        }
        if (session.scheduledAt && Date.now() < new Date(session.scheduledAt).getTime()) {
            return res.status(400).json({
                success: false,
                message: "A session cannot be completed before its scheduled start time."
            });
        }

        const settled = await settleSessionCredits(session._id, new Date());
        if (!settled) {
            return res.status(409).json({
                success: false,
                message: "Session was already completed or is no longer eligible for settlement."
            });
        }

        await notifySessionSettlement(session);
        return res.status(200).json({
            success: true,
            message: "Session completed successfully! Credits and ledger updated.",
            data: { session: settled }
        });
    } catch (error) {
        if (error.code === "INSUFFICIENT_CREDITS") {
            return res.status(409).json({ success: false, message: error.message });
        }
        next(error);
    }
};


/**
 * PATCH /api/sessions/:sessionId/cancel
 * Cancel a session
 */
export const cancelSession =
    async (
        req,
        res,
        next
    ) => {
        try {
            const session =
                await Session.findOne({
                    _id:
                        req.params.sessionId,

                    $or: [
                        {
                            teacher:
                                req.user._id
                        },
                        {
                            learner:
                                req.user._id
                        }
                    ]
                });

            if (!session) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Session not found"
                });
            }

            if (
                session.status ===
                "completed"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Completed session cannot be cancelled"
                });
            }

            if (
                session.status ===
                "cancelled"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Session is already cancelled"
                });
            }

            session.status =
                "cancelled";

            await session.save();

            await session.populate([
                {
                    path: "teacher",
                    select:
                        "firstName lastName name username profilePhotoUrl headline rating"
                },
                {
                    path: "learner",
                    select:
                        "firstName lastName name username profilePhotoUrl headline rating"
                }
            ]);

            return res.status(200).json({
                success: true,

                message:
                    "Session cancelled successfully",

                data: {
                    session
                }
            });
        } catch (error) {
            next(error);
        }
    };