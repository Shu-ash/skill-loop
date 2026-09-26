import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

const PILL_COLORS = ['pill-mint', 'pill-violet', 'pill-coral', 'pill-gold'];
const BADGES = ['Live now', 'Trending', 'Popular', 'Top category'];

export default function CategoriesSection() {
  const [categories, setCategories] = useState([
    { name: 'Design & Product', badge: 'Live now', pill: 'pill-mint', teachers: 'Teachers available', cat: 'Design' },
    { name: 'Code & Data', badge: 'Trending', pill: 'pill-violet', teachers: 'Teachers available', cat: 'Code' },
    { name: 'Languages', badge: 'New', pill: 'pill-coral', teachers: 'Teachers available', cat: 'Languages' },
    { name: 'Music & Craft', badge: 'Popular', pill: 'pill-gold', teachers: 'Teachers available', cat: 'Music' }
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.categories) && data.data.categories.length > 0) {
          const dynamicCategories = data.data.categories.slice(0, 6).map((c, i) => ({
            name: c.name,
            badge: BADGES[i % BADGES.length],
            pill: PILL_COLORS[i % PILL_COLORS.length],
            teachers: `${c.teacherCount || 1} teacher${(c.teacherCount || 1) > 1 ? 's' : ''} offering skills`,
            cat: c.name
          }));
          setCategories(dynamicCategories);
        }
      } catch (err) {
        console.error('Failed to load dynamic categories:', err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="categories-section">
      <div className="categories-feed">
        {categories.map((item, idx) => (
          <Link key={idx} className="glass-card category-card" to={`/browse?category=${encodeURIComponent(item.cat)}`}>
            <div>
              <span className={`pill-badge ${item.pill}`}>{item.badge}</span>
              <h4>{item.name}</h4>
              <p>{item.teachers}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}