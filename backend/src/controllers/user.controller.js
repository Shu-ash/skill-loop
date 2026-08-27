import User from "../models/user.js";

/**
 * GET /api/users/me
 * Get logged-in user's profile
 */
export const getMyProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};


/**
 * PUT /api/users/onboarding
 * Complete/update onboarding
 */
export const completeOnboarding = async (
    req,
    res,
    next
) => {
    try {
        const {
            username,
            profilePhotoUrl,
            bio,
            headline,
            skillsCanTeach,
            skillsWantToLearn,
            skillLevel
        } = req.body;

        // BASIC VALIDATION

        if (!username || !username.trim()) {
            return res.status(400).json({
                success: false,
                message: "Username is required"
            });
        }

        if (
            !Array.isArray(skillsCanTeach) ||
            skillsCanTeach.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Select at least one skill you can teach"
            });
        }

        if (
            !Array.isArray(skillsWantToLearn) ||
            skillsWantToLearn.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Select at least one skill you want to learn"
            });
        }

        const allowedLevels = [
            "beginner",
            "intermediate",
            "advanced"
        ];

        if (
            skillLevel &&
            !allowedLevels.includes(skillLevel)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill level"
            });
        }

        // NORMALIZE USERNAME

        const normalizedUsername =
            username
                .trim()
                .replace(/^@/, "")
                .toLowerCase();

        // CHECK USERNAME

        const usernameExists =
            await User.findOne({
                username: normalizedUsername,
                _id: {
                    $ne: req.user._id
                }
            });

        if (usernameExists) {
            return res.status(409).json({
                success: false,
                message: "Username is already taken"
            });
        }

        // CLEAN SKILLS

        const cleanTeachSkills =
            [...new Set(
                skillsCanTeach
                    .map((skill) => String(skill).trim())
                    .filter(Boolean)
            )];

        const cleanLearnSkills =
            [...new Set(
                skillsWantToLearn
                    .map((skill) => String(skill).trim())
                    .filter(Boolean)
            )];

        if (cleanTeachSkills.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "At least one teaching skill is required"
            });
        }

        if (cleanLearnSkills.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "At least one learning skill is required"
            });
        }

        // UPDATE USER

        const user =
            await User.findByIdAndUpdate(
                req.user._id,
                {
                    username: normalizedUsername,

                    profilePhotoUrl:
                        profilePhotoUrl?.trim() || "",

                    bio:
                        bio?.trim() || "",

                    headline:
                        headline?.trim() || "",

                    skillsCanTeach:
                        cleanTeachSkills,

                    skillsWantToLearn:
                        cleanLearnSkills,

                    skillLevel:
                        skillLevel || "beginner",

                    onboardingCompleted: true
                },
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Onboarding completed successfully",
            data: {
                user
            }
        });

    } catch (error) {
        next(error);
    }
};


/**
 * PATCH /api/users/me
 * Update profile
 */
export const updateMyProfile = async (
    req,
    res,
    next
) => {
    try {
        const allowedFields = [
            "name",
            "username",
            "profilePhotoUrl",
            "bio",
            "headline",
            "skillsCanTeach",
            "skillsWantToLearn",
            "skillLevel"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (
            updates.username !== undefined
        ) {
            updates.username =
                updates.username
                    .trim()
                    .replace(/^@/, "")
                    .toLowerCase();

            const usernameExists =
                await User.findOne({
                    username: updates.username,
                    _id: {
                        $ne: req.user._id
                    }
                });

            if (usernameExists) {
                return res.status(409).json({
                    success: false,
                    message: "Username is already taken"
                });
            }
        }

        if (
            updates.skillsCanTeach !== undefined
        ) {
            if (
                !Array.isArray(
                    updates.skillsCanTeach
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "skillsCanTeach must be an array"
                });
            }

            updates.skillsCanTeach =
                [...new Set(
                    updates.skillsCanTeach
                        .map((skill) =>
                            String(skill).trim()
                        )
                        .filter(Boolean)
                )];
        }

        if (
            updates.skillsWantToLearn !== undefined
        ) {
            if (
                !Array.isArray(
                    updates.skillsWantToLearn
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "skillsWantToLearn must be an array"
                });
            }

            updates.skillsWantToLearn =
                [...new Set(
                    updates.skillsWantToLearn
                        .map((skill) =>
                            String(skill).trim()
                        )
                        .filter(Boolean)
                )];
        }

        const user =
            await User.findByIdAndUpdate(
                req.user._id,
                updates,
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                user
            }
        });

    } catch (error) {
        next(error);
    }
};