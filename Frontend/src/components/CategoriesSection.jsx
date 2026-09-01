// src/components/CategoriesSection.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

const PILL_COLORS = ['pill-violet', 'pill-mint', 'pill-coral', 'pill-gold'];
const BADGES = ['Trending', 'Live now', 'Popular', 'Featured'];

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.categories)) {
          const formatted = data.data.categories.map((item, idx) => ({
            id: item.id || idx,
            name: `${item.icon ? item.icon + ' ' : ''}${item.name}`,
            badge: BADGES[idx % BADGES.length],
            pill: PILL_COLORS[idx % PILL_COLORS.length],
            skillsCount: (item.skills || []).length,
            teachers: `${(item.skills || []).length} skills active`,
            cat: item.name
          }));
          setCategories(formatted);
        }
      } catch (err) {
        console.error('Failed to load categories in CategoriesSection:', err);
      }
    };
    fetchCats();
  }, []);

  return (
    <section className="categories-section">
      <div className="categories-feed">
        {categories.map((item) => (
          <Link key={item.id} className="glass-card category-card" to={`/browse?category=${encodeURIComponent(item.cat)}`}>
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