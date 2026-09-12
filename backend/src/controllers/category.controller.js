import Category from "../models/category.js";
import User from "../models/user.js";

export const getPublicCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({ status: "Active" }).sort({ memberCount: -1 }).lean();

    if (!categories || categories.length === 0) {
      const defaultCategories = [
        { name: "Code & Data", icon: "💻", description: "Web Dev, Python, Backend, Data Science" },
        { name: "Design & UI", icon: "🎨", description: "UI/UX, Figma, Graphic Design, Prototyping" },
        { name: "Languages", icon: "🗣️", description: "English, Spanish, French, Public Speaking" },
        { name: "AI & Machine Learning", icon: "🤖", description: "Deep Learning, LLMs, NLP, Prompting" },
        { name: "Marketing & Growth", icon: "📈", description: "SEO, Social Media, Growth, Copywriting" },
        { name: "Music & Arts", icon: "🎵", description: "Guitar, Vocals, Piano, Production" }
      ];

      await Category.insertMany(defaultCategories.map(c => ({ ...c, status: "Active" })));
      categories = await Category.find({ status: "Active" }).lean();
    }

    const users = await User.find({ status: { $ne: "banned" } }).select("skillsCanTeach").lean();

    const categoryStats = categories.map((cat) => {
      const catKeywords = cat.name.toLowerCase().split(/[\s&,/]+/);
      const teacherCount = users.filter((u) => {
        const skillsText = (u.skillsCanTeach || []).join(" ").toLowerCase();
        return catKeywords.some((kw) => kw.length > 2 && skillsText.includes(kw));
      }).length;

      return {
        id: cat._id,
        name: cat.name,
        icon: cat.icon || "⚡",
        description: cat.description || "",
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
