import Session from "../models/session.js";

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

        // =========================
        // START TIME CHECK
        // =========================

        const now = new Date();

        const scheduledTime =
            new Date(
                session.scheduledAt
            );

        /*
         * Allow starting up to 15 minutes
         * before the scheduled time.
         */
        const earliestStart =
            new Date(
                scheduledTime.getTime() -
                15 * 60 * 1000
            );

        if (now < earliestStart) {
            return res.status(400).json({
                success: false,
                message:
                    `Session can be started 15 minutes before the scheduled time`
            });
        }

        // =========================
        // START
        // =========================

        session.status =
            "in_progress";

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
                session.status !==
                "in_progress"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Session must be in progress before it can be completed"
                });
            }

            session.status =
                "completed";

            session.completedAt =
                new Date();

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
                    "Session completed successfully",

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