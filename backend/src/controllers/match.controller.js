import User from "../models/user.js";

export const getRecommendedUsers = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.user._id).lean();

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const skillsToLearn = currentUser.skillsWantToLearn || [];
        const skillsToTeach = currentUser.skillsCanTeach || [];

        const users = await User.find({
            _id: { $ne: req.user._id }
        })
            .select(
                "name username profilePhotoUrl bio headline skillsCanTeach skillsWantToLearn skillLevel rating ratingCount credits"
            )
            .lean();

        const normalize = (skill) =>
            String(skill).trim().toLowerCase();

        const learnSet = new Set(
            skillsToLearn.map(normalize)
        );

        const teachSet = new Set(
            skillsToTeach.map(normalize)
        );

        const recommendations = users
            .map((user) => {
                const userTeachSet = new Set(
                    (user.skillsCanTeach || []).map(normalize)
                );

                const userLearnSet = new Set(
                    (user.skillsWantToLearn || []).map(normalize)
                );

                // Skills this user can teach that I want to learn
                const canTeachMe = [
                    ...userTeachSet
                ].filter((skill) => learnSet.has(skill));

                // Skills I can teach that this user wants to learn
                const canLearnFromMe = [
                    ...userLearnSet
                ].filter((skill) => teachSet.has(skill));

                const totalMatches =
                    canTeachMe.length +
                    canLearnFromMe.length;

                return {
                    ...user,
                    matchScore: totalMatches,
                    matchedSkills: canTeachMe,
                    reciprocalSkills: canLearnFromMe
                };
            })
            .filter((user) => user.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);

        return res.status(200).json({
            success: true,
            data: {
                recommendations
            }
        });
    } catch (error) {
        next(error);
    }
};