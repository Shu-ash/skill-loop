import User from "../models/user.js";
import Session from "../models/session.js";
import SwapRequest from "../models/swapRequest.js";
import Review from "../models/review.js";

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
 * PATCH /api/users/me & PATCH /api/users/profile
 * Update profile
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "firstName",
      "lastName",
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

    // Aliases support
    if (req.body.teachSkills !== undefined && updates.skillsCanTeach === undefined) {
      updates.skillsCanTeach = req.body.teachSkills;
    }
    if (req.body.learnSkills !== undefined && updates.skillsWantToLearn === undefined) {
      updates.skillsWantToLearn = req.body.learnSkills;
    }

    // Name splitting into firstName & lastName
    if (updates.name) {
      const parts = updates.name.trim().split(/\s+/);
      updates.firstName = parts[0] || "Member";
      updates.lastName = parts.slice(1).join(" ") || "";
    } else if (updates.firstName || updates.lastName) {
      updates.name = `${updates.firstName || ""} ${updates.lastName || ""}`.trim();
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
    const { skill, search, page = 1, limit = 50 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

    let currentUserId = req.user?._id;
    const authHeader = req.headers.authorization;
    if (!currentUserId && authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = verifyAccessToken(token);
        if (decoded?.sub) {
          currentUserId = decoded.sub;
        }
      } catch (e) {}
    }

    const filter = { status: { $ne: "banned" }, role: { $nin: ["superadmin", "admin"] } };
    if (currentUserId) {
      filter._id = { $ne: currentUserId };
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
      username: u.username ? `@${u.username.replace(/^@/, '')}` : `@${(u.email || '').split('@')[0]}`,
      headline: u.headline || u.bio || 'SkillLoop Community Member 🚀',
      bio: u.bio || '',
      skillsCanTeach: u.skillsCanTeach || [],
      skillsWantToLearn: u.skillsWantToLearn || [],
      rating: u.rating !== undefined ? u.rating : 5.0,
      credits: u.credits !== undefined ? u.credits : 0,
      profilePhotoUrl: u.profilePhotoUrl || ""
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
 * Top teachers ranked by sessions taught and rating (dynamic from MongoDB)
 */
export const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ status: { $ne: "banned" }, role: { $nin: ["superadmin", "admin"] } })
      .select("name firstName lastName username rating credits skillsCanTeach profilePhotoUrl")
      .lean();

    // Dynamically query actual completed sessions taught for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const completedSessionsCount = await Session.countDocuments({
          teacher: u._id,
          status: "completed"
        });
        return {
          ...u,
          sessionsCount: completedSessionsCount
        };
      })
    );

    // Sort by sessions taught descending, then rating descending, then credits descending
    usersWithStats.sort((a, b) => {
      if (b.sessionsCount !== a.sessionsCount) {
        return b.sessionsCount - a.sessionsCount;
      }
      return (b.rating || 5.0) - (a.rating || 5.0);
    });

    const topUsers = usersWithStats.slice(0, 10);

    const formattedList = topUsers.map((u, idx) => {
      const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'SkillLoop Member';
      const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'SL';
      return {
        rank: idx + 1,
        id: u._id,
        name,
        avatar: u.profilePhotoUrl || initials,
        avatarBg: idx === 0 ? 'var(--violet-primary)' : idx === 1 ? 'var(--coral-primary)' : 'var(--mint-primary)',
        sessions: u.sessionsCount,
        rating: `${(u.rating || 5.0).toFixed(1)} ★`,
        skills: (u.skillsCanTeach || []).slice(0, 2).join(' • ') || 'Skill Swap'
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
 * Live stats for current user (dynamic from MongoDB)
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("credits rating skillsCanTeach skillsWantToLearn");

    // Dynamic count of active swap requests
    const activeSwaps = await SwapRequest.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
      status: { $in: ["pending", "accepted"] }
    });

    // Dynamic count of completed sessions taught by this user
    const sessionsTaught = await Session.countDocuments({
      teacher: userId,
      status: "completed"
    });

    // Dynamic rating from Review collection if any reviews exist
    const reviews = await Review.find({ reviewee: userId }).select("rating");
    let calculatedRating = user?.rating || 5.0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      calculatedRating = sum / reviews.length;
    }

    return res.status(200).json({
      success: true,
      data: {
        credits: user?.credits ?? 0,
        activeSwaps,
        rating: Number(calculatedRating).toFixed(1),
        sessionsTaught
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/community-stats
 * Live platform-wide community statistics for public landing page
 */
export const getCommunityStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({
      status: { $ne: "banned" },
      role: { $nin: ["superadmin", "admin"] }
    });

    const completedSessions = await Session.countDocuments({ status: "completed" });
    const allSessions = await Session.countDocuments();
    const acceptedSwaps = await SwapRequest.countDocuments({ status: "accepted" });

    // Reviews average
    const reviews = await Review.find().select("rating");
    let avgRating = 5.0;
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
      avgRating = total / reviews.length;
    }

    return res.status(200).json({
      success: true,
      data: {
        totalMembers: totalUsers,
        totalSessionsSwapped: completedSessions + acceptedSwaps || allSessions,
        averageRating: `${Number(avgRating).toFixed(1)} ★`
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/change-password
 * Change logged-in user password securely
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match"
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (currentPassword && user.password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect current password"
        });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully!"
    });
  } catch (error) {
    next(error);
  }
};