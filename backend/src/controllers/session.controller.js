import Session from "../models/session.js";
import User from "../models/user.js";
import CreditLedger from "../models/creditLedger.js";
import Notification from "../models/notification.js";

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

        // =========================
        // VALIDATE DATE
        // =========================

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

        if (
            parsedDate <= new Date()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Scheduled time must be in the future"
            });
        }

        // =========================
        // VALIDATE MODE
        // =========================

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

        // =========================
        // VALIDATE MEET LINK
        // =========================

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

        // =========================
        // VALIDATE DURATION
        // =========================

        const selectedDuration =
            Number(duration ?? 45);

        const allowedDurations = [
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
                    "Duration must be 30, 45, 60, 90, or 120 minutes"
            });
        }

        // =========================
        // FIND SESSION
        // =========================

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

        // =========================
        // STATUS CHECK
        // =========================

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

        // =========================
        // SAVE
        // =========================

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
export const completeSession =
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
                        "Session is already completed"
                });
            }

            if (
                session.status ===
                "cancelled"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Cancelled session cannot be completed"
                });
            }

            if (
                session.status !== "in_progress" &&
                session.status !== "scheduled"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Session must be active before it can be completed"
                });
            }

            session.status = "completed";
            session.completedAt = new Date();
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

            const teacherName = session.teacher?.name || `${session.teacher?.firstName || ''} ${session.teacher?.lastName || ''}`.trim() || 'Teacher';
            const learnerName = session.learner?.name || `${session.learner?.firstName || ''} ${session.learner?.lastName || ''}`.trim() || 'Learner';

            // 1. Credit Economy: Teacher earns +1, Learner spends -1
            await Promise.all([
                User.findByIdAndUpdate(session.teacher._id, { $inc: { credits: 1, ratingCount: 1 } }),
                User.findByIdAndUpdate(session.learner._id, { $inc: { credits: -1 } })
            ]);

            // 2. Audit Trail: Create CreditLedger records
            await CreditLedger.insertMany([
                {
                    sender: session.learner._id,
                    receiver: session.teacher._id,
                    amount: 1,
                    type: "earned",
                    description: `Taught ${session.skill} to ${learnerName}`
                },
                {
                    sender: session.learner._id,
                    receiver: session.teacher._id,
                    amount: 1,
                    type: "spent",
                    description: `Learned ${session.skill} from ${teacherName}`
                }
            ]);

            // 3. In-App Notifications: Live notifications for both parties
            await Notification.insertMany([
                {
                    user: session.teacher._id,
                    title: "🎉 +1 Skill Credit Earned!",
                    text: `Session completed! You earned +1 credit for teaching ${session.skill} to ${learnerName}.`,
                    type: "credit_earned",
                    link: "/credits"
                },
                {
                    user: session.learner._id,
                    title: "🎓 Class Completed (-1 Credit)",
                    text: `Completed ${session.skill} class with ${teacherName}. 1 credit deducted.`,
                    type: "credit_spent",
                    link: "/credits"
                }
            ]);

            return res.status(200).json({
                success: true,
                message: "Session completed successfully! Credits and ledger updated.",
                data: {
                    session
                }
            });
        } catch (error) {
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