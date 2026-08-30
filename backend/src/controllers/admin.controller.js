import User from "../models/user.js";
import Session from "../models/session.js";
import Category from "../models/category.js";
import Report from "../models/report.js";
import CreditLedger from "../models/creditLedger.js";
import Notification from "../models/notification.js";
import { hashPassword } from "../utils/password.js";

// GET /api/admin/metrics - Real-time KPI Statistics
export const getAdminMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSessions = await Session.countDocuments();
    const activeSessions = await Session.countDocuments({ status: { $in: ["scheduled", "in_progress"] } });
    const completedSessions = await Session.countDocuments({ status: "completed" });
    const disputedSessions = await Session.countDocuments({ status: "disputed" });
    const totalCategories = await Category.countDocuments({ status: "Active" });
    const pendingReports = await Report.countDocuments({ status: "pending" });

    // Calculate total unique skills from all categories in MongoDB
    const allCategories = await Category.find({ status: "Active" }, "skills");
    const allSkillsSet = new Set();
    allCategories.forEach(c => {
      if (Array.isArray(c.skills)) {
        c.skills.forEach(s => allSkillsSet.add(s.trim()));
      }
    });

    const creditAggregate = await User.aggregate([
      { $group: { _id: null, totalCredits: { $sum: "$credits" } } }
    ]);
    const creditsCirculating = creditAggregate[0]?.totalCredits || 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalSessions,
        activeSessions,
        completedSessions,
        totalSkills: allSkillsSet.size,
        disputedSessions,
        totalCategories,
        pendingReports,
        creditsCirculating
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/admin/users - User management list with formatted short IDs & handles
export const getAdminUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } }
      ];
    }

    if (role && role !== "All") query.role = role.toLowerCase();
    if (status && status !== "All") query.status = status.toLowerCase();

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });

    const formattedUsers = users.map(u => {
      const rawId = u._id.toString();
      const shortId = `#USR-${rawId.slice(-6).toUpperCase()}`;
      return {
        id: rawId,
        displayId: shortId,
        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'SkillLoop Member',
        email: u.email,
        handle: u.username ? `@${u.username}` : `@${(u.email || '').split('@')[0]}`,
        skill: u.skillsCanTeach?.[0] || 'Member Skill',
        role: u.role === 'admin' || u.role === 'superadmin' ? 'Admin' : 'User',
        status: u.status === 'banned' ? 'Banned' : 'Active',
        credits: u.credits || 10,
        createdAt: u.createdAt
      };
    });

    res.status(200).json({
      success: true,
      data: { users: formattedUsers }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/users/:userId/role - Update User Role
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: "Role is required" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (targetUser.role === "superadmin" || targetUser.email === "admin@skillloop.com") {
      return res.status(403).json({
        success: false,
        message: "Super Admin role is protected and cannot be demoted or changed."
      });
    }

    targetUser.role = role.toLowerCase();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${targetUser.role}`,
      data: { user: targetUser }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/users/:userId/status - Toggle User Status (Active / Banned)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (targetUser.role === "superadmin" || targetUser.email === "admin@skillloop.com") {
      return res.status(403).json({
        success: false,
        message: "Super Admin account is protected and cannot be banned."
      });
    }

    targetUser.status = status.toLowerCase();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `User status updated to ${targetUser.status}`,
      data: { user: targetUser }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/users/:userId/password - Reset User Password by Admin
export const updateUserPasswordByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    targetUser.password = await hashPassword(password);
    await targetUser.save();

    await Notification.create({
      user: targetUser._id,
      title: "🔒 Password Updated by Administrator",
      text: "Your account password was securely updated by a system administrator.",
      type: "system",
      link: "/profile"
    });

    res.status(200).json({
      success: true,
      message: `Password updated successfully for ${targetUser.name || targetUser.email}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/sessions - Monitor all sessions & disputes
export const getAdminSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate("teacher", "name firstName lastName email")
      .populate("learner", "name firstName lastName email")
      .sort({ createdAt: -1 });

    const formatted = sessions.map(s => ({
      id: s._id,
      displayId: `#SES-${s._id.toString().slice(-6).toUpperCase()}`,
      teacher: s.teacher?.name || s.teacher?.firstName || 'Teacher',
      learner: s.learner?.name || s.learner?.firstName || 'Learner',
      topic: s.skill || 'Skill Swap',
      status: s.status === 'completed' ? 'Completed' : s.status === 'disputed' ? 'Disputed' : s.status === 'cancelled' ? 'Cancelled' : 'Scheduled',
      meetLink: s.meetLink || '',
      scheduledAt: s.scheduledAt
    }));

    res.status(200).json({
      success: true,
      data: { sessions: formatted }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/sessions/:sessionId/dispute - Resolve Dispute & Credit Settlement
export const resolveSessionDispute = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { resolution, awardTo } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    session.status = "completed";
    session.disputeDetails = {
      resolution: resolution || "Resolved by Admin",
      resolvedAt: new Date()
    };
    await session.save();

    if (awardTo === "teacher" && session.teacher) {
      await User.findByIdAndUpdate(session.teacher, { $inc: { credits: 1 } });
      await CreditLedger.create({
        sender: session.learner,
        receiver: session.teacher,
        session: session._id,
        amount: 1,
        transactionType: "dispute_refund",
        description: `Dispute resolved in favor of teacher: ${resolution || 'Resolved'}`
      });
    } else if (awardTo === "learner" && session.learner) {
      await User.findByIdAndUpdate(session.learner, { $inc: { credits: 1 } });
      await CreditLedger.create({
        sender: session.teacher,
        receiver: session.learner,
        session: session._id,
        amount: 1,
        transactionType: "dispute_refund",
        description: `Dispute resolved in favor of learner: ${resolution || 'Resolved'}`
      });
    }

    res.status(200).json({
      success: true,
      message: `Dispute resolved: ${resolution || 'Settled'}`,
      data: { session }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/credits - Audit Credit Transfers Ledger
export const getAdminCreditsLedger = async (req, res) => {
  try {
    const ledgerEntries = await CreditLedger.find()
      .populate("sender", "name firstName")
      .populate("receiver", "name firstName")
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedTransactions = ledgerEntries.map(tx => ({
      id: `#TX-${tx._id.toString().slice(-6).toUpperCase()}`,
      sender: tx.sender?.name || tx.sender?.firstName || 'Learner',
      receiver: tx.receiver?.name || tx.receiver?.firstName || 'Teacher',
      amount: `+${tx.amount} Credit`,
      date: new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      description: tx.description
    }));

    res.status(200).json({
      success: true,
      data: { transactions: formattedTransactions }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/categories - Skill Categories Audit
export const getAdminCategories = async (req, res) => {
  try {
    let categories = await Category.find().sort({ name: 1 });

    const formatted = categories.map(c => ({
      id: c._id,
      name: c.name,
      description: c.description || 'Skill category',
      icon: c.icon || '⚡',
      skills: Array.isArray(c.skills) ? c.skills : [],
      count: c.memberCount || 0,
      status: c.status || 'Active'
    }));

    res.status(200).json({
      success: true,
      data: { categories: formatted }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/categories - Create Skill Category
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, skills } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const cleanSkills = Array.isArray(skills)
      ? [...new Set(skills.map(s => String(s).trim()).filter(Boolean))]
      : typeof skills === 'string'
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || 'Skill Category',
      icon: icon || '⚡',
      skills: cleanSkills
    });

    res.status(201).json({
      success: true,
      message: "Skill category created successfully",
      data: { category }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/categories/:id - Update Skill Category & Skills
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, skills, status } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (icon) updates.icon = icon;
    if (status) updates.status = status;
    if (skills !== undefined) {
      updates.skills = Array.isArray(skills)
        ? [...new Set(skills.map(s => String(s).trim()).filter(Boolean))]
        : typeof skills === 'string'
        ? skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
    }

    const category = await Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: { category }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/categories/:id - Delete Skill Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/reports - Moderation Queue Reports
export const getAdminReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "name email")
      .populate("reportedUser", "name email")
      .sort({ createdAt: -1 });

    const formattedReports = reports.map(r => ({
      id: r._id,
      displayId: `#REP-${r._id.toString().slice(-6).toUpperCase()}`,
      reporterName: r.reporter?.name || 'User',
      reportedName: r.reportedUser?.name || 'User',
      reason: r.reason,
      status: r.status === 'resolved' ? 'Resolved' : 'Pending',
      createdAt: r.createdAt
    }));

    res.status(200).json({
      success: true,
      data: { reports: formattedReports }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/reports/:reportId/resolve - Resolve Moderation Report
export const resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action } = req.body;

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status: action === 'dismissed' ? 'dismissed' : 'resolved' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Report ${action || 'resolved'}`,
      data: { report }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
