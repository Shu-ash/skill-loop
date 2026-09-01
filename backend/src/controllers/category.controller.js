import Category from "../models/category.js";

/**
 * GET /api/categories
 * Get all active categories and skills live from MongoDB database
 */
export const getActiveCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ status: "Active" }).sort({ name: 1 }).lean();

    const formatted = categories.map(c => ({
      id: c._id,
      name: c.name,
      icon: c.icon || '⚡',
      description: c.description || '',
      skills: Array.isArray(c.skills) ? c.skills : [],
      memberCount: c.memberCount || 0
    }));

    return res.status(200).json({
      success: true,
      data: {
        categories: formatted
      }
    });
  } catch (error) {
    next(error);
  }
};
