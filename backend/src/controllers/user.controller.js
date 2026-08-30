import User from "../models/user.js";
import Session from "../models/session.js";
import SwapRequest from "../models/swapRequest.js";
import bcrypt from "bcryptjs";
import { verifyAccessToken } from "../utils/jwt.js";

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
      profilePhotoUrl: u.profilePhotoUrl || '',
      skillsCanTeach: Array.isArray(u.skillsCanTeach) ? u.skillsCanTeach : [],
      skillsWantToLearn: Array.isArray(u.skillsWantToLearn) ? u.skillsWantToLearn : [],
      rating: u.rating || 0.0,
      ratingCount: u.ratingCount || 0,
      credits: u.credits || 10
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
 * Top teachers ranked by real sessions taught and rating
 */
export const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ status: { $ne: "banned" }, role: { $nin: ["superadmin", "admin"] } })
      .select("name firstName lastName username rating ratingCount credits skillsCanTeach profilePhotoUrl")
      .lean();

    const usersWithSessions = await Promise.all(
      users.map(async (u) => {
        const completedSessions = await Session.countDocuments({
          teacher: u._id,
          status: "completed"
        });
        return {
          ...u,
          completedSessions
        };
      })
    );

    usersWithSessions.sort((a, b) => {
      if (b.completedSessions !== a.completedSessions) {
        return b.completedSessions - a.completedSessions;
      }
      if (b.rating !== a.rating) {
        return (b.rating || 0) - (a.rating || 0);
      }
      return (b.credits || 0) - (a.credits || 0);
    });

    const formattedList = usersWithSessions.map((u, idx) => {
      const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'SkillLoop Member';
      const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'SL';
      return {
        rank: idx + 1,
        id: u._id,
        name,
        avatar: initials,
        avatarBg: idx === 0 ? 'var(--violet-primary)' : idx === 1 ? 'var(--coral-primary)' : 'var(--mint-primary)',
        sessions: u.completedSessions || 0,
        rating: `${(u.rating || 0).toFixed(1)} ★`,
        skills: Array.isArray(u.skillsCanTeach) && u.skillsCanTeach.length ? u.skillsCanTeach.slice(0, 2).join(' • ') : 'Community Member'
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
 * Live real stats for current user
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("credits rating ratingCount skillsCanTeach skillsWantToLearn");

    const [activeSwaps, sessionsTaught, pendingRequests, upcomingSessions] = await Promise.all([
      SwapRequest.countDocuments({
        $or: [{ sender: userId }, { receiver: userId }],
        status: { $in: ["pending", "accepted"] }
      }),
      Session.countDocuments({
        teacher: userId,
        status: "completed"
      }),
      SwapRequest.countDocuments({
        receiver: userId,
        status: "pending"
      }),
      Session.countDocuments({
        $or: [{ teacher: userId }, { learner: userId }],
        status: { $in: ["scheduled", "in_progress"] }
      })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        credits: user?.credits ?? 10,
        activeSwaps,
        rating: (user?.rating || 0).toFixed(1),
        sessionsTaught,
        pendingRequests,
        upcomingSessions
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