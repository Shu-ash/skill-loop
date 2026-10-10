import Category from "../models/category.js";
import User from "../models/user.js";
import { ensureSkillsCatalogSynced } from "../utils/skillCatalog.js";

export const getPublicCategories = async (req, res, next) => {
  try {
    await ensureSkillsCatalogSynced();

    const categories = await Category.find({ status: "Active" }).sort({ memberCount: -1, name: 1 }).lean();
    const users = await User.find({ status: { $ne: "banned" }, role: { $nin: ["superadmin", "admin"] } })
      .select("skillsCanTeach")
      .lean();

    const categoryStats = categories.map((cat) => {
      const catKeywords = cat.name.toLowerCase().split(/[\s&,/]+/);
      const catSkillsLower = (cat.skills || []).map((s) => String(s).toLowerCase().trim());

      const teacherCount = users.filter((u) => {
        const userTeachSkills = (u.skillsCanTeach || []).map((s) => String(s).toLowerCase().trim());
        return userTeachSkills.some(
          (us) =>
            catSkillsLower.some((cs) => cs === us || cs.includes(us) || us.includes(cs)) ||
            catKeywords.some((kw) => kw.length > 2 && us.includes(kw))
        );
      }).length;

      return {
        _id: cat._id,
        id: cat._id,
        name: cat.name,
        icon: cat.icon || "⚡",
        description: cat.description || "",
        skills: Array.isArray(cat.skills) ? cat.skills : [],
        teacherCount: teacherCount || cat.memberCount || 0
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        categories: categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
};
