// src/controllers/skill.controller.js
import Skill from "../models/skill.js";
import Category from "../models/category.js";
<<<<<<< HEAD
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
=======

/**
 * GET /api/skills
 * List active skills with optional category filter or search query
 */
export const getSkills = async (req, res, next) => {
  try {
    const { category, search, popular, page = 1, limit = 100 } = req.query;

    const filter = { status: "Active" };

    if (category) {
      // Can be category ID or category name
      const cat = await Category.findOne({
        $or: [{ _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }, { name: category }]
      });
      if (cat) {
        filter.category = cat._id;
>>>>>>> fe68e6f7d4a41cc49d73e53208844384fce29555
      }
    }

    if (popular === "true") {
      filter.isPopular = true;
    }

<<<<<<< HEAD
    const rawQuery = search?.trim() || "";
    if (rawQuery) {
      const safePattern = escapeRegex(rawQuery);
      const searchRegex = { $regex: safePattern, $options: "i" };
=======
    if (search?.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
>>>>>>> fe68e6f7d4a41cc49d73e53208844384fce29555
      filter.$or = [
        { name: searchRegex },
        { aliases: searchRegex },
        { categoryName: searchRegex }
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
<<<<<<< HEAD
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 250);
    const skip = (pageNum - 1) * limitNum;

    const [skillsRaw, total] = await Promise.all([
=======
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [skills, total] = await Promise.all([
>>>>>>> fe68e6f7d4a41cc49d73e53208844384fce29555
      Skill.find(filter)
        .populate("category", "name icon")
        .sort({ isPopular: -1, name: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Skill.countDocuments(filter)
    ]);

<<<<<<< HEAD
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

=======
>>>>>>> fe68e6f7d4a41cc49d73e53208844384fce29555
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
<<<<<<< HEAD
    await ensureSkillsCatalogSynced();

=======
>>>>>>> fe68e6f7d4a41cc49d73e53208844384fce29555
    const popularSkills = await Skill.find({ status: "Active", isPopular: true })
      .populate("category", "name icon")
      .limit(15)
      .lean();

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
<<<<<<< HEAD
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
=======
 * POST /api/skills/suggest
 * Suggest a new skill (Protected)
 */
export const suggestSkill = async (req, res, next) => {
  try {
    const { name, categoryId, description } = req.body;

    if (!name?.trim() || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Skill name and category are required"
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const cleanName = name.trim();
    const existing = await Skill.findOne({ name: { $regex: `^${cleanName}$`, $options: "i" } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This skill already exists in our database"
      });
    }

    const newSkill = await Skill.create({
      name: cleanName,
      category: category._id,
      categoryName: category.name,
      icon: category.icon || "⚡",
      description: description?.trim() || "",
      requestedBy: req.user._id,
      status: "Active" // Automatically available
    });

    // Also add into Category's skills array if not present
    if (!category.skills.includes(cleanName)) {
      category.skills.push(cleanName);
      await category.save();
    }

    return res.status(201).json({
      success: true,
      message: "Skill added successfully!",
      data: { skill: newSkill }
>>>>>>> fe68e6f7d4a41cc49d73e53208844384fce29555
    });
  } catch (error) {
    next(error);
  }
};
<<<<<<< HEAD

=======
>>>>>>> fe68e6f7d4a41cc49d73e53208844384fce29555
