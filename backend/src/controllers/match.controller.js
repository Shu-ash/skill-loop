import User from "../models/user.js";

const normalize = (skill) => String(skill || "").trim().toLowerCase();

const isSkillMatch = (skillA, skillB) => {
    const a = normalize(skillA);
    const b = normalize(skillB);
    if (!a || !b) return false;
    if (a === b) return true;
    if (a.includes(b) || b.includes(a)) return true;
    
    // Check keyword tokens
    const wordsA = a.split(/[\s,./\-+]+/).filter((w) => w.length > 2);
    const wordsB = b.split(/[\s,./\-+]+/).filter((w) => w.length > 2);
    return wordsA.some((w) => wordsB.includes(w));
};

export const getRecommendedUsers = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.user._id).lean();

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const myLearnSkills = Array.isArray(currentUser.skillsWantToLearn) ? currentUser.skillsWantToLearn : [];
        const myTeachSkills = Array.isArray(currentUser.skillsCanTeach) ? currentUser.skillsCanTeach : [];

        const users = await User.find({
            _id: { $ne: req.user._id },
            status: { $ne: "banned" },
            role: { $nin: ["superadmin", "admin"] }
        })
            .select(
                "name firstName lastName username profilePhotoUrl bio headline skillsCanTeach skillsWantToLearn skillLevel rating ratingCount credits"
            )
            .lean();

        const scoredUsers = users.map((otherUser) => {
            const theirTeach = Array.isArray(otherUser.skillsCanTeach) ? otherUser.skillsCanTeach : [];
            const theirLearn = Array.isArray(otherUser.skillsWantToLearn) ? otherUser.skillsWantToLearn : [];

            // 1. Skills they teach that I want to learn
            const canTeachMe = theirTeach.filter((theirSkill) =>
                myLearnSkills.some((mySkill) => isSkillMatch(theirSkill, mySkill))
            );

            // 2. Skills I teach that they want to learn
            const canLearnFromMe = theirLearn.filter((theirSkill) =>
                myTeachSkills.some((mySkill) => isSkillMatch(theirSkill, mySkill))
            );

            // 3. Similar skills (shared teaching or learning domains)
            const similarSkills = theirTeach.filter((theirSkill) =>
                myTeachSkills.some((mySkill) => isSkillMatch(theirSkill, mySkill))
            );

            const isMutual = canTeachMe.length > 0 && canLearnFromMe.length > 0;
            const isLearnMatch = canTeachMe.length > 0;
            const isTeachMatch = canLearnFromMe.length > 0;
            const isSimilar = similarSkills.length > 0;

            let matchScore = 0;
            let matchType = "community";

            if (isMutual) {
                matchScore = 100 + canTeachMe.length * 15 + canLearnFromMe.length * 15;
                matchType = "mutual";
            } else if (isLearnMatch) {
                matchScore = 60 + canTeachMe.length * 10;
                matchType = "learn";
            } else if (isTeachMatch) {
                matchScore = 40 + canLearnFromMe.length * 10;
                matchType = "teach";
            } else if (isSimilar) {
                matchScore = 20 + similarSkills.length * 5;
                matchType = "similar";
            } else {
                matchScore = 5 + (otherUser.rating || 5.0);
                matchType = "community";
            }

            const fullName = otherUser.name || `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim() || "SkillLoop Member";

            return {
                _id: otherUser._id,
                id: otherUser._id.toString(),
                name: fullName,
                username: otherUser.username ? `@${otherUser.username.replace(/^@/, "")}` : `@${(fullName).toLowerCase().replace(/\s+/g, "_")}`,
                headline: otherUser.headline || otherUser.bio || "SkillLoop Community Member 🚀",
                bio: otherUser.bio || "",
                profilePhotoUrl: otherUser.profilePhotoUrl || "",
                skillsCanTeach: theirTeach,
                skillsWantToLearn: theirLearn,
                rating: otherUser.rating !== undefined ? otherUser.rating : 5.0,
                ratingCount: otherUser.ratingCount || 0,
                credits: otherUser.credits ?? 10,
                matchScore,
                matchType,
                canTeachMe,
                canLearnFromMe,
                similarSkills,
                isMutual,
                isLearnMatch,
                isTeachMatch,
                isSimilar
            };
        });

        // Sort by match score descending, then rating descending
        scoredUsers.sort((a, b) => {
            if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
            return (b.rating || 5.0) - (a.rating || 5.0);
        });

        const mutualMatches = scoredUsers.filter((u) => u.isMutual);
        const learnMatches = scoredUsers.filter((u) => u.isLearnMatch);
        const teachMatches = scoredUsers.filter((u) => u.isTeachMatch);
        const similarMatches = scoredUsers.filter((u) => u.isSimilar);

        return res.status(200).json({
            success: true,
            data: {
                recommendations: scoredUsers,
                mutualMatches,
                learnMatches,
                teachMatches,
                similarMatches,
                totalCommunityMembers: scoredUsers.length
            }
        });
    } catch (error) {
        next(error);
    }
};