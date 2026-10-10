import mongoose from "mongoose";
import { env } from "../config/env.js";
import Category from "../models/category.js";

const categoriesSeed = [
  {
    name: 'Tech & Code',
    icon: '💻',
    description: 'Learn full-stack web development, backend APIs, mobile apps, and databases',
    skills: [
      'React JS',
      'Node.js',
      'Python',
      'JavaScript',
      'TypeScript',
      'HTML & CSS',
      'Next.js',
      'MongoDB',
      'SQL & PostgreSQL',
      'Git & GitHub',
      'Docker & DevOps',
      'C++',
      'Java & Spring Boot',
      'Flutter & Dart',
      'Tailwind CSS'
    ],
    status: 'Active'
  },
  {
    name: 'AI & Data Science',
    icon: '🤖',
    description: 'Master Artificial Intelligence, prompt engineering, machine learning, and data analytics',
    skills: [
      'Machine Learning',
      'Prompt Engineering & LLMs',
      'ChatGPT & OpenAI API',
      'Data Analysis & Pandas',
      'Deep Learning',
      'PyTorch & TensorFlow',
      'Computer Vision',
      'Natural Language Processing (NLP)',
      'Data Visualization & Power BI'
    ],
    status: 'Active'
  },
  {
    name: 'Design & Arts',
    icon: '🎨',
    description: 'Craft beautiful user interfaces, graphic designs, 3D art, and brand visuals',
    skills: [
      'UI/UX Design',
      'Figma & Prototyping',
      'Logo & Brand Identity',
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Canva Pro',
      '3D Blender Animation',
      'Video Editing (Premiere Pro)',
      'Motion Graphics & After Effects',
      'Design Systems'
    ],
    status: 'Active'
  },
  {
    name: 'Languages & Study',
    icon: '🗣️',
    description: 'Practice spoken languages, public speaking, academic subjects, and communication',
    skills: [
      'English Conversation & Fluency',
      'Spanish Language',
      'French Language',
      'German Language',
      'Japanese Language',
      'Hindi Fluency',
      'Public Speaking & Pitching',
      'Mathematics & Statistics',
      'Academic Writing & Research'
    ],
    status: 'Active'
  },
  {
    name: 'Business & Growth',
    icon: '📈',
    description: 'Scale businesses with modern digital marketing, SEO, finance, and product strategy',
    skills: [
      'Digital Marketing',
      'SEO Optimization',
      'Content Strategy',
      'Social Media Growth & Instagram',
      'Copywriting & Sales',
      'Financial Modeling & Excel',
      'Product Management',
      'Startup Pitching & Strategy',
      'Google & Meta Ads'
    ],
    status: 'Active'
  },
  {
    name: 'Music & Audio',
    icon: '🎵',
    description: 'Learn musical instruments, vocal techniques, music production, and audio engineering',
    skills: [
      'Acoustic Guitar',
      'Piano Basics & Chords',
      'Vocal Training & Singing',
      'Music Production',
      'FL Studio & Beat Making',
      'Ableton Live',
      'Sound Design & Mixing',
      'Songwriting'
    ],
    status: 'Active'
  },
  {
    name: 'Lifestyle & Fitness',
    icon: '🧘',
    description: 'Cultivate personal wellness, fitness, cooking, photography, and mindful habits',
    skills: [
      'Fitness & Gym Coaching',
      'Yoga & Mindfulness',
      'Cooking & Baking Basics',
      'Nutrition & Diet Planning',
      'Photography & Lighting',
      'Creative Writing'
    ],
    status: 'Active'
  }
];

async function seedCategorySkills() {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB Atlas");

  // Remove old categories with old names if any
  await Category.deleteMany({
    name: {
      $in: ['Code & Data', 'Design & UI', 'Languages', 'Marketing & Growth']
    }
  });

  for (const cat of categoriesSeed) {
    await Category.findOneAndUpdate(
      { name: cat.name },
      { $set: cat },
      { new: true, upsert: true }
    );
    console.log(`✓ Seeded ${cat.icon} ${cat.name} with ${cat.skills.length} skills`);
  }

  const all = await Category.find().sort({ name: 1 });
  console.log("\nSummary of all categories in MongoDB Atlas:");
  all.forEach(c => console.log(`${c.icon} ${c.name} -> ${c.skills.length} skills`));

  await mongoose.disconnect();
  console.log("Category seeding complete!");
  process.exit(0);
}

seedCategorySkills().catch(err => {
  console.error("Error seeding skills:", err);
  process.exit(1);
});
