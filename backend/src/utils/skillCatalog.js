// src/utils/skillCatalog.js
import Category from "../models/category.js";
import Skill from "../models/skill.js";

export const escapeRegex = (str = "") =>
  String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const MASTER_SKILL_CATALOG = [
  {
    name: "AI & Data Science",
    icon: "🤖",
    description: "Master Artificial Intelligence, prompt engineering, machine learning, and data analytics",
    skills: [
      { name: "Machine Learning", aliases: ["ml", "ai/ml", "ai & ml", "ai", "artificial intelligence"], isPopular: true },
      { name: "Prompt Engineering & LLMs", aliases: ["prompt engineering", "llms", "llm", "prompting"], isPopular: true },
      { name: "ChatGPT & OpenAI API", aliases: ["chatgpt", "openai", "openai api", "gpt"], isPopular: false },
      { name: "Python for AI", aliases: ["ai python", "data science", "ai & data science"], isPopular: false },
      { name: "Data Analysis & Pandas", aliases: ["data analysis", "pandas", "data analyst", "numpy"], isPopular: false },
      { name: "Deep Learning", aliases: ["neural networks", "dl"], isPopular: false },
      { name: "PyTorch & TensorFlow", aliases: ["pytorch", "tensorflow", "keras"], isPopular: false },
      { name: "Computer Vision", aliases: ["opencv", "image processing", "cv"], isPopular: false },
      { name: "Natural Language Processing (NLP)", aliases: ["nlp", "natural language processing", "text mining"], isPopular: false },
      { name: "Data Visualization & Power BI", aliases: ["data visualization", "power bi", "tableau", "charts"], isPopular: false },
      { name: "LangChain & AI Agents", aliases: ["langchain", "ai agents", "rag"], isPopular: false }
    ]
  },
  {
    name: "Tech & Code",
    icon: "💻",
    description: "Learn full-stack web development, backend APIs, mobile apps, and databases",
    skills: [
      { name: "React JS", aliases: ["react", "reactjs", "react.js", "frontend", "web development"], isPopular: true },
      { name: "Node.js", aliases: ["node", "nodejs", "node.js backend", "backend"], isPopular: true },
      { name: "Python", aliases: ["py", "python3", "coding"], isPopular: true },
      { name: "JavaScript", aliases: ["js", "es6", "vanilla js", "ecmascript"], isPopular: true },
      { name: "TypeScript", aliases: ["ts"], isPopular: false },
      { name: "HTML & CSS", aliases: ["html", "css", "html/css", "css grid", "flexbox"], isPopular: false },
      { name: "Next.js", aliases: ["nextjs", "next"], isPopular: false },
      { name: "Express.js", aliases: ["express", "expressjs", "rest apis", "api"], isPopular: false },
      { name: "MongoDB", aliases: ["mongo", "mongoose", "nosql", "mongodb indexing"], isPopular: false },
      { name: "SQL & PostgreSQL", aliases: ["sql", "postgresql", "postgres", "mysql", "database"], isPopular: false },
      { name: "Git & GitHub", aliases: ["git", "github", "version control"], isPopular: false },
      { name: "Docker & DevOps", aliases: ["docker", "devops", "kubernetes", "ci/cd", "aws"], isPopular: false },
      { name: "C++", aliases: ["cpp", "c plus plus", "dsa"], isPopular: false },
      { name: "Java & Spring Boot", aliases: ["java", "spring boot", "spring"], isPopular: false },
      { name: "Flutter & Dart", aliases: ["flutter", "dart", "mobile dev", "react native"], isPopular: false },
      { name: "Tailwind CSS", aliases: ["tailwind", "tailwindcss"], isPopular: false }
    ]
  },
  {
    name: "Design & Arts",
    icon: "🎨",
    description: "Craft beautiful user interfaces, graphic designs, 3D art, and brand visuals",
    skills: [
      { name: "UI/UX Design", aliases: ["ui/ux", "ui design", "ux design", "wireframing", "user research"], isPopular: true },
      { name: "Figma & Prototyping", aliases: ["figma", "figma ui design", "prototyping"], isPopular: true },
      { name: "Logo & Brand Identity", aliases: ["logo design", "branding", "brand identity"], isPopular: false },
      { name: "Adobe Photoshop", aliases: ["photoshop", "ps", "photo editing"], isPopular: false },
      { name: "Adobe Illustrator", aliases: ["illustrator", "vector art", "drawing", "illustration"], isPopular: false },
      { name: "Canva Pro", aliases: ["canva", "social media graphics"], isPopular: false },
      { name: "3D Blender Animation", aliases: ["blender", "3d modeling", "3d animation"], isPopular: false },
      { name: "Video Editing (Premiere Pro)", aliases: ["video editing", "premiere pro", "editing", "capcut", "davinci resolve"], isPopular: false },
      { name: "Motion Graphics & After Effects", aliases: ["motion graphics", "after effects", "vfx"], isPopular: false },
      { name: "Design Systems", aliases: ["design system", "component library"], isPopular: false }
    ]
  },
  {
    name: "Languages & Study",
    icon: "🗣️",
    description: "Practice spoken languages, public speaking, academic subjects, and communication",
    skills: [
      { name: "English Conversation & Fluency", aliases: ["english", "english communication", "spoken english", "pronunciation", "interview prep"], isPopular: true },
      { name: "Spanish Language", aliases: ["spanish", "espanol"], isPopular: false },
      { name: "French Language", aliases: ["french", "francais"], isPopular: false },
      { name: "German Language", aliases: ["german", "deutsch"], isPopular: false },
      { name: "Japanese Language", aliases: ["japanese", "nihongo"], isPopular: false },
      { name: "Hindi Fluency", aliases: ["hindi", "spoken hindi"], isPopular: false },
      { name: "Public Speaking & Pitching", aliases: ["public speaking", "pitching", "speech", "debate"], isPopular: false },
      { name: "Business Communication", aliases: ["communication", "professional writing", "email writing"], isPopular: false },
      { name: "Mathematics & Statistics", aliases: ["math", "mathematics", "statistics", "calculus"], isPopular: false },
      { name: "Academic Writing & Research", aliases: ["academic writing", "research", "essay writing"], isPopular: false }
    ]
  },
  {
    name: "Business & Growth",
    icon: "📈",
    description: "Scale businesses with modern digital marketing, SEO, finance, and product strategy",
    skills: [
      { name: "Digital Marketing", aliases: ["marketing", "growth marketing", "online marketing"], isPopular: true },
      { name: "SEO Optimization", aliases: ["seo", "technical seo", "search engine optimization"], isPopular: false },
      { name: "Content Strategy", aliases: ["content creation", "content creater", "content creator", "youtube strategy"], isPopular: false },
      { name: "Social Media Growth", aliases: ["social media growth & instagram", "social media", "instagram growth", "linkedin growth"], isPopular: false },
      { name: "Copywriting & Sales", aliases: ["copywriting", "sales", "cold email"], isPopular: false },
      { name: "Financial Modeling & Excel", aliases: ["excel", "finance", "financial modeling", "accounting"], isPopular: false },
      { name: "Product Management", aliases: ["pm", "agile", "scrum"], isPopular: false },
      { name: "Startup Pitching & Strategy", aliases: ["startup", "startup planing", "startup planning", "business strategy"], isPopular: false },
      { name: "Google & Meta Ads", aliases: ["google ads", "meta ads", "facebook ads", "ppc"], isPopular: false }
    ]
  },
  {
    name: "Music & Audio",
    icon: "🎵",
    description: "Learn musical instruments, vocal techniques, music production, and audio engineering",
    skills: [
      { name: "Acoustic Guitar", aliases: ["guitar", "electric guitar", "chords"], isPopular: true },
      { name: "Piano Basics & Chords", aliases: ["piano", "keyboard", "music theory"], isPopular: false },
      { name: "Vocal Training & Singing", aliases: ["singing", "vocal training", "vocals", "voice"], isPopular: false },
      { name: "Music Production", aliases: ["music & audio", "beat making", "producing"], isPopular: false },
      { name: "FL Studio & Beat Making", aliases: ["fl studio", "beats"], isPopular: false },
      { name: "Ableton Live", aliases: ["ableton"], isPopular: false },
      { name: "Audio Mixing & Mastering", aliases: ["sound design & mixing", "mixing", "mastering", "audio engineering"], isPopular: false },
      { name: "Songwriting", aliases: ["lyrics", "composing"], isPopular: false }
    ]
  },
  {
    name: "Lifestyle & Fitness",
    icon: "🧘",
    description: "Cultivate personal wellness, fitness, cooking, photography, and mindful habits",
    skills: [
      { name: "Fitness & Gym Coaching", aliases: ["fitness", "gym", "workout", "gym trainer", "gym  trainer", "calisthenics"], isPopular: false },
      { name: "Yoga & Mindfulness", aliases: ["yoga", "meditation", "mindfulness", "breathwork"], isPopular: false },
      { name: "Cooking & Baking Basics", aliases: ["cooking", "baking", "culinary", "cooking & culinary arts"], isPopular: false },
      { name: "Nutrition & Diet Planning", aliases: ["nutrition", "diet", "meal prep"], isPopular: false },
      { name: "Photography & Lighting", aliases: ["photography", "camera", "dslr", "lighting"], isPopular: false },
      { name: "Creative Writing", aliases: ["writing", "storytelling", "fiction"], isPopular: false },
      { name: "Personal Productivity", aliases: ["productivity", "time management", "notion"], isPopular: false }
    ]
  }
];

let lastSyncedAt = 0;
const SYNC_TTL_MS = 60 * 1000; // 1 minute cache

export const invalidateSkillCatalogCache = () => {
  lastSyncedAt = 0;
};

/**
 * Ensures MongoDB Category & Skill collections contain all curated skills
 * and that Category.skills and Skill documents are synchronized.
 */
export const ensureSkillsCatalogSynced = async (force = false) => {
  const now = Date.now();
  if (!force && now - lastSyncedAt < SYNC_TTL_MS) {
    return;
  }

  try {
    const existingCategories = await Category.find({});
    const catByName = new Map(existingCategories.map((c) => [c.name.toLowerCase(), c]));

    for (const masterCat of MASTER_SKILL_CATALOG) {
      const masterSkillNames = masterCat.skills.map((s) => s.name);
      let catDoc = catByName.get(masterCat.name.toLowerCase());

      if (!catDoc) {
        catDoc = await Category.create({
          name: masterCat.name,
          icon: masterCat.icon,
          description: masterCat.description,
          skills: masterSkillNames,
          status: "Active"
        });
        catByName.set(masterCat.name.toLowerCase(), catDoc);
      } else {
        const currentSkills = Array.isArray(catDoc.skills) ? catDoc.skills : [];
        const currentLower = new Set(currentSkills.map((s) => s.toLowerCase().trim()));
        let modified = false;

        for (const sName of masterSkillNames) {
          if (!currentLower.has(sName.toLowerCase())) {
            catDoc.skills.push(sName);
            currentLower.add(sName.toLowerCase());
            modified = true;
          }
        }
        if (!catDoc.icon && masterCat.icon) {
          catDoc.icon = masterCat.icon;
          modified = true;
        }
        if (modified) {
          await catDoc.save();
        }
      }

      // Ensure each master skill exists in the Skill collection with its aliases
      for (const sObj of masterCat.skills) {
        await Skill.findOneAndUpdate(
          { name: sObj.name },
          {
            $set: {
              name: sObj.name,
              category: catDoc._id,
              categoryName: catDoc.name,
              icon: catDoc.icon || masterCat.icon || "⚡",
              isPopular: Boolean(sObj.isPopular),
              status: "Active"
            },
            $addToSet: {
              aliases: { $each: sObj.aliases || [] }
            }
          },
          { upsert: true, returnDocument: "after" }
        );
      }
    }

    // Also ensure any custom skills added by Admin into Category.skills exist in Skill collection
    const allActiveCats = await Category.find({ status: "Active" }).lean();
    for (const cat of allActiveCats) {
      if (Array.isArray(cat.skills)) {
        for (const rawSkill of cat.skills) {
          const cleanName = String(rawSkill || "").trim();
          if (!cleanName) continue;
          await Skill.findOneAndUpdate(
            { name: cleanName },
            {
              $setOnInsert: {
                name: cleanName,
                category: cat._id,
                categoryName: cat.name,
                icon: cat.icon || "⚡",
                status: "Active"
              }
            },
            { upsert: true }
          );
        }
      }
    }

    lastSyncedAt = Date.now();
  } catch (err) {
    console.error("Skill catalog sync error:", err.message);
  }
};

/**
 * Syncs a specific Category's skills array with the Skill collection
 * (called when Admin creates/updates/deletes a category).
 */
export const syncCategorySkillsToCollection = async (categoryDoc) => {
  if (!categoryDoc) return;
  const skillNames = Array.isArray(categoryDoc.skills)
    ? categoryDoc.skills.map((s) => String(s || "").trim()).filter(Boolean)
    : [];

  for (const cleanName of skillNames) {
    await Skill.findOneAndUpdate(
      { name: { $regex: `^${escapeRegex(cleanName)}$`, $options: "i" } },
      {
        $set: {
          name: cleanName,
          category: categoryDoc._id,
          categoryName: categoryDoc.name,
          icon: categoryDoc.icon || "⚡",
          status: categoryDoc.status === "Inactive" ? "Inactive" : "Active"
        }
      },
      { upsert: true, new: true }
    );
  }

  invalidateSkillCatalogCache();
};

/**
 * Builds a lookup table of all valid active database skills (canonical names + aliases).
 */
export const getValidSkillsLookup = async () => {
  await ensureSkillsCatalogSynced();

  const [skills, categories] = await Promise.all([
    Skill.find({ status: "Active" }).lean(),
    Category.find({ status: "Active" }).lean()
  ]);

  const canonicalByLower = new Map();
  const canonicalByAlias = new Map();

  for (const cat of categories) {
    for (const s of cat.skills || []) {
      const clean = String(s || "").trim();
      if (clean) {
        canonicalByLower.set(clean.toLowerCase(), clean);
      }
    }
  }

  for (const sk of skills) {
    const clean = String(sk.name || "").trim();
    if (clean) {
      canonicalByLower.set(clean.toLowerCase(), clean);
      if (Array.isArray(sk.aliases)) {
        for (const al of sk.aliases) {
          const cleanAlias = String(al || "").trim().toLowerCase();
          if (cleanAlias && !canonicalByLower.has(cleanAlias)) {
            canonicalByAlias.set(cleanAlias, clean);
          }
        }
      }
    }
  }

  return { canonicalByLower, canonicalByAlias, skills, categories };
};

/**
 * Validates an array of skill names against the MongoDB database.
 * Rejects any non-database text (e.g. "abcd", "1234", random text) and
 * normalizes valid skills/aliases to their canonical database skill name.
 */
export const validateAndNormalizeSkills = async (inputSkills = []) => {
  if (!Array.isArray(inputSkills)) {
    return { validSkills: [], invalidSkills: ["Invalid skills format"], isValid: false };
  }

  const { canonicalByLower, canonicalByAlias } = await getValidSkillsLookup();

  const validSkillsSet = new Set();
  const invalidSkills = [];

  for (const raw of inputSkills) {
    const trimmed = String(raw || "").trim();
    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();
    const canonical = canonicalByLower.get(lower) || canonicalByAlias.get(lower);

    if (canonical) {
      validSkillsSet.add(canonical);
    } else {
      invalidSkills.push(trimmed);
    }
  }

  return {
    validSkills: Array.from(validSkillsSet),
    invalidSkills,
    isValid: invalidSkills.length === 0
  };
};
