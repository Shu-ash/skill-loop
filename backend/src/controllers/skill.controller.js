// src/controllers/skill.controller.js
import Skill from "../models/skill.js";
import Category from "../models/category.js";

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
      }
    }

    if (popular === "true") {
      filter.isPopular = true;
    }

    if (search?.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { name: searchRegex },
        { aliases: searchRegex },
        { categoryName: searchRegex }
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [skills, total] = await Promise.all([
      Skill.find(filter)
        .populate("category", "name icon")
        .sort({ isPopular: -1, name: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Skill.countDocuments(filter)
    ]);

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
    });
  } catch (error) {
    next(error);
  }
};
