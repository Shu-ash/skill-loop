// src/data/categoriesData.js

export const MASTER_CATEGORIES = [
  {
    name: 'AI & Data Science',
    icon: '🤖',
    keywords: ['ai', 'data', 'machine learning', 'deep learning', 'llm', 'chatgpt', 'openai', 'pandas', 'nlp', 'vision', 'langchain', 'pytorch', 'tensorflow', 'analytics'],
    skills: [
      'Machine Learning',
      'Prompt Engineering & LLMs',
      'ChatGPT & OpenAI API',
      'Python for AI',
      'Data Analysis & Pandas',
      'Deep Learning',
      'PyTorch & TensorFlow',
      'Computer Vision',
      'Natural Language Processing (NLP)',
      'Data Visualization & Power BI',
      'LangChain & AI Agents'
    ]
  },
  {
    name: 'Tech & Code',
    icon: '💻',
    keywords: ['code', 'tech', 'dev', 'developer', 'software', 'web', 'frontend', 'backend', 'fullstack', 'react', 'node', 'javascript', 'typescript', 'python', 'database', 'sql', 'mongodb', 'docker', 'git', 'c++', 'java'],
    skills: [
      'React JS',
      'Node.js',
      'Python',
      'JavaScript',
      'TypeScript',
      'HTML & CSS',
      'Next.js',
      'Express.js',
      'MongoDB',
      'SQL & PostgreSQL',
      'Git & GitHub',
      'Docker & DevOps',
      'C++',
      'Java & Spring Boot',
      'Flutter & Dart',
      'Tailwind CSS'
    ]
  },
  {
    name: 'Design & Arts',
    icon: '🎨',
    keywords: ['design', 'art', 'ui', 'ux', 'figma', 'creative', 'graphic', 'photoshop', 'illustrator', 'canva', 'blender', '3d', 'video', 'editing', 'premiere', 'after effects', 'motion', 'brand'],
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
    ]
  },
  {
    name: 'Languages & Study',
    icon: '🗣️',
    keywords: ['language', 'study', 'english', 'spanish', 'french', 'german', 'japanese', 'hindi', 'speaking', 'fluency', 'communication', 'academic', 'writing', 'pitching'],
    skills: [
      'English Conversation & Fluency',
      'Spanish Language',
      'French Language',
      'German Language',
      'Japanese Language',
      'Hindi Fluency',
      'Public Speaking & Pitching',
      'Business Communication',
      'Academic Writing & Research'
    ]
  },
  {
    name: 'Business & Growth',
    icon: '📈',
    keywords: ['business', 'growth', 'market', 'marketing', 'seo', 'sales', 'strategy', 'finance', 'excel', 'product', 'management', 'startup', 'ads', 'copywriting', 'content'],
    skills: [
      'Digital Marketing',
      'SEO Optimization',
      'Content Strategy',
      'Social Media Growth',
      'Copywriting & Sales',
      'Financial Modeling & Excel',
      'Product Management',
      'Startup Pitching & Strategy',
      'Google & Meta Ads'
    ]
  },
  {
    name: 'Music & Audio',
    icon: '🎵',
    keywords: ['music', 'audio', 'sound', 'guitar', 'piano', 'singing', 'vocal', 'fl studio', 'ableton', 'mixing', 'mastering', 'beat', 'songwriting', 'chords'],
    skills: [
      'Acoustic Guitar',
      'Piano Basics & Chords',
      'Vocal Training & Singing',
      'Music Production',
      'FL Studio & Beat Making',
      'Ableton Live',
      'Audio Mixing & Mastering',
      'Songwriting'
    ]
  },
  {
    name: 'Lifestyle & Fitness',
    icon: '🧘',
    keywords: ['fitness', 'gym', 'workout', 'yoga', 'mindfulness', 'cooking', 'baking', 'nutrition', 'diet', 'photography', 'lighting', 'creative writing', 'productivity', 'health', 'wellness'],
    skills: [
      'Fitness & Gym Coaching',
      'Yoga & Mindfulness',
      'Cooking & Baking Basics',
      'Nutrition & Diet Planning',
      'Photography & Lighting',
      'Creative Writing',
      'Personal Productivity'
    ]
  }
];

export const DEFAULT_CATEGORY_NAMES = [
  'All categories',
  ...MASTER_CATEGORIES.map(c => c.name)
];

/**
 * Checks if a member matches a given category.
 */
export function isMemberMatchingCategory(member, categoryName, categoriesData = []) {
  if (!categoryName || categoryName === 'All categories') {
    return true;
  }

  // 1. Direct match on member.categories array if present
  if (Array.isArray(member?.categories) && member.categories.includes(categoryName)) {
    return true;
  }

  const catNameLower = categoryName.toLowerCase().trim();

  // 2. Find master definition or live backend definition
  const masterDef = MASTER_CATEGORIES.find(c => c.name.toLowerCase() === catNameLower);
  const liveDef = categoriesData.find(c => c.name?.toLowerCase() === catNameLower);

  const curatedSkills = [
    ...(masterDef?.skills || []),
    ...(Array.isArray(liveDef?.skills) ? liveDef.skills : [])
  ].map(s => s.toLowerCase().trim());

  const keywords = [
    ...(masterDef?.keywords || []),
    ...categoryName.toLowerCase().split(/[\s&,/]+/).filter(w => w.length > 2)
  ];

  const memberSkills = Array.isArray(member?.skills) ? member.skills : [];
  const memberSkillsLower = memberSkills.map(s => s.toLowerCase().trim());
  const memberTitleLower = (member?.title || '').toLowerCase().trim();

  // 3. Match against curated skills
  const matchesSkill = memberSkillsLower.some(skill => {
    if (curatedSkills.some(cs => skill === cs || skill.includes(cs) || cs.includes(skill))) {
      return true;
    }
    return keywords.some(kw => skill.includes(kw));
  });

  if (matchesSkill) return true;

  // 4. Match against member headline / title keywords
  const matchesTitle = keywords.some(kw => memberTitleLower.includes(kw));
  if (matchesTitle) return true;

  return false;
}
