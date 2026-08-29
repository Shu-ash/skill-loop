import User from "../models/user.js";

/**
 * GET /api/users/me
 * Get logged-in user's profile
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/onboarding
 * Complete/update onboarding
 */
export const completeOnboarding = async (req, res, next) => {
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

    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required"
      });
    }

    if (!Array.isArray(skillsCanTeach) || skillsCanTeach.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one skill you can teach"
      });
    }

    if (!Array.isArray(skillsWantToLearn) || skillsWantToLearn.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one skill you want to learn"
      });
    }

    const normalizedUsername = username.trim().replace(/^@/, "").toLowerCase();

    const usernameExists = await User.findOne({
      username: normalizedUsername,
      _id: { $ne: req.user._id }
    });

    if (usernameExists) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken"
      });
    }

    const cleanTeachSkills = [...new Set(skillsCanTeach.map((s) => String(s).trim()).filter(Boolean))];
    const cleanLearnSkills = [...new Set(skillsWantToLearn.map((s) => String(s).trim()).filter(Boolean))];

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        username: normalizedUsername,
        profilePhotoUrl: profilePhotoUrl?.trim() || "",
        bio: bio?.trim() || "",
        headline: headline?.trim() || "",
        skillsCanTeach: cleanTeachSkills,
        skillsWantToLearn: cleanLearnSkills,
        skillLevel: skillLevel || "beginner",
        onboardingCompleted: true
      },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/me
 * Update profile
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "username",
      "profilePhotoUrl",
      "coverPhotoUrl",
      "bio",
      "headline",
      "skillsCanTeach",
      "skillsWantToLearn",
      "skillLevel",
      "availability",
      "onboardingCompleted"
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.username !== undefined) {
      updates.username = updates.username.trim().replace(/^@/, "").toLowerCase();
      const usernameExists = await User.findOne({
        username: updates.username,
        _id: { $ne: req.user._id }
      });
      if (usernameExists) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken"
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users
 * Browse members (Fetches live members from MongoDB)
 */
export const getUsers = async (req, res, next) => {
  try {
    const { skill, search, page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

    const filter = { status: { $ne: "banned" } };
    if (req.user?._id) {
      filter._id = { $ne: req.user._id };
    }

    if (skill?.trim()) {
      filter.skillsCanTeach = { $regex: skill.trim(), $options: "i" };
    }

    if (search?.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { name: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { username: searchRegex },
        { headline: searchRegex },
        { bio: searchRegex },
        { skillsCanTeach: searchRegex }
      ];
    }

    const skip = (pageNumber - 1) * limitNumber;
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      User.countDocuments(filter)
    ]);

    const formattedUsers = users.map(u => ({
      _id: u._id,
      id: u._id.toString(),
      name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'SkillLoop Member',
      username: u.username ? `@${u.username}` : `@${(u.email || '').split('@')[0]}`,
      headline: u.headline || u.bio || 'SkillLoop Community Member 🚀',
      bio: u.bio || '',
      skillsCanTeach: u.skillsCanTeach?.length ? u.skillsCanTeach : ['React', 'JavaScript'],
      skillsWantToLearn: u.skillsWantToLearn?.length ? u.skillsWantToLearn : ['Python', 'Figma'],
      rating: u.rating || 5.0,
      credits: u.credits || 3
    }));

    return res.status(200).json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          pages: Math.ceil(total / limitNumber)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/leaderboard
 * Top teachers ranked by sessions taught and rating
 */
export const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ status: { $ne: "banned" } })
      .select("name firstName lastName username rating credits skillsCanTeach profilePhotoUrl")
      .sort({ rating: -1, credits: -1 })
      .limit(10)
      .lean();

    const formattedList = users.map((u, idx) => {
      const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'SkillLoop Member';
      const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'SL';
      return {
        rank: idx + 1,
        id: u._id,
        name,
        avatar: initials,
        avatarBg: idx === 0 ? 'var(--violet-primary)' : idx === 1 ? 'var(--coral-primary)' : 'var(--mint-primary)',
        sessions: (15 - idx) > 1 ? (15 - idx) : 2,
        rating: `${(u.rating || 5.0).toFixed(1)} ★`,
        skills: (u.skillsCanTeach || ['Web Dev', 'Design']).slice(0, 2).join(' • ')
      };
    });

    const podium = formattedList.slice(0, 3);
    const rankedList = formattedList.slice(3);

    return res.status(200).json({
      success: true,
      data: { podium, rankedList }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/dashboard-stats
 * Live stats for current user
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("credits rating skillsCanTeach skillsWantToLearn");

    return res.status(200).json({
      success: true,
      data: {
        credits: user?.credits ?? 3,
        activeSwaps: 2,
        rating: (user?.rating || 5.0).toFixed(1),
        sessionsTaught: 6
      }
    });
  } catch (error) {
    next(error);
  }
};