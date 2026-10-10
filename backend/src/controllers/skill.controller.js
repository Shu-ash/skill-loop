// src/controllers/skill.controller.js
import Skill from "../models/skill.js";
import Category from "../models/category.js";
import {
  ensureSkillsCatalogSynced,
  escapeRegex,
  validateAndNormalizeSkills
} from "../utils/skillCatalog.js";

/**
 * GET /api/skills
 * List active skills with optional category filter or live search query
 */
export const getSkills = async (req, res, next) => {
  try {
    await ensureSkillsCatalogSynced();

    const { category, search, popular, page = 1, limit = 150 } = req.query;

    const filter = { status: "Active" };

    if (category && category !== "All categories") {
      const cat = await Category.findOne({
        $or: [
          { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null },
          { name: { $regex: `^${escapeRegex(category.trim())}$`, $options: "i" } }
        ]
      });
      if (cat) {
        filter.category = cat._id;
      } else {
        filter.categoryName = { $regex: escapeRegex(category.trim()), $options: "i" };
      }
    }

    if (popular === "true") {
      filter.isPopular = true;
    }

    const rawQuery = search?.trim() || "";
    if (rawQuery) {
      const safePattern = escapeRegex(rawQuery);
      const searchRegex = { $regex: safePattern, $options: "i" };
      filter.$or = [
        { name: searchRegex },
        { aliases: searchRegex },
        { categoryName: searchRegex }
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 250);
    const skip = (pageNum - 1) * limitNum;

    const [skillsRaw, total] = await Promise.all([
      Skill.find(filter)
        .populate("category", "name icon")
        .sort({ isPopular: -1, name: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Skill.countDocuments(filter)
    ]);

    let skills = skillsRaw.map((sk) => {
      const catName =
        sk.category?.name ||
        sk.categoryName ||
        (typeof sk.category === "string" ? sk.category : "General");
      const catIcon = sk.category?.icon || sk.icon || "⚡";
      return {
        ...sk,
        categoryObj: typeof sk.category === "object" ? sk.category : null,
        category: catName,
        categoryName: catName,
        icon: catIcon
      };
    });

    // Relevance sorting when searching live
    if (rawQuery) {
      const qLower = rawQuery.toLowerCase();
      skills.sort((a, b) => {
        const aName = (a.name || "").toLowerCase();
        const bName = (b.name || "").toLowerCase();
        const aAliases = (a.aliases || []).map((al) => al.toLowerCase());
        const bAliases = (b.aliases || []).map((al) => al.toLowerCase());

        const getScore = (name, aliases) => {
          if (name === qLower) return 100;
          if (aliases.includes(qLower)) return 90;
          if (name.startsWith(qLower)) return 80;
          if (name.includes(qLower)) return 60;
          if (aliases.some((al) => al.startsWith(qLower))) return 50;
          if (aliases.some((al) => al.includes(qLower))) return 40;
          return 10;
        };

        const scoreDiff = getScore(bName, bAliases) - getScore(aName, aAliases);
        if (scoreDiff !== 0) return scoreDiff;
        return aName.localeCompare(bName);
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        skills,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/skills/popular
 * List trending / popular skills
 */
export const getPopularSkills = async (req, res, next) => {
  try {
    await ensureSkillsCatalogSynced();

    const popularSkillsRaw = await Skill.find({ status: "Active", isPopular: true })
      .populate("category", "name icon")
      .limit(15)
      .lean();

    const popularSkills = popularSkillsRaw.map((sk) => {
      const catName =
        sk.category?.name ||
        sk.categoryName ||
        (typeof sk.category === "string" ? sk.category : "General");
      const catIcon = sk.category?.icon || sk.icon || "⚡";
      return {
        ...sk,
        categoryObj: typeof sk.category === "object" ? sk.category : null,
        category: catName,
        categoryName: catName,
        icon: catIcon
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        skills: popularSkills
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/skills/validate
 * Validate one or more skill names against the live MongoDB database
 */
export const validateSkillsEndpoint = async (req, res, next) => {
  try {
    const { skill, skills } = req.body;
    const listToCheck = Array.isArray(skills)
      ? skills
      : skill !== undefined
      ? [skill]
      : [];

    const result = await validateAndNormalizeSkills(listToCheck);

    return res.status(200).json({
      success: result.isValid,
      message: result.isValid
        ? "All skills are valid"
        : `Skill not found in database: ${result.invalidSkills.join(", ")}`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/skills/suggest
 * Suggest a new skill (Protected - queues for admin approval, does not auto-inject arbitrary text)
 */
export const suggestSkill = async (req, res, next) => {
  try {
    const { name } = req.body;
    const result = await validateAndNormalizeSkills([name]);
    if (result.isValid && result.validSkills.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Skill matches database",
        data: { skill: { name: result.validSkills[0] } }
      });
    }

    return res.status(400).json({
      success: false,
      message: "Only verified skills from the database can be added. Please choose from the live suggestions."
    });
  } catch (error) {
    next(error);
  }
};
