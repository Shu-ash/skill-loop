// src/components/CategoriesSection.jsx

import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoriesSection() {

    {/* Define the categories data */}
  const categories = [
    { name: 'Design & Product', badge: 'Live now', pill: 'pill-mint', teachers: '214 teachers online', cat: 'Design' },
    { name: 'Code & Data', badge: 'Trending', pill: 'pill-violet', teachers: '380 teachers online', cat: 'Code' },
    { name: 'Languages', badge: 'New', pill: 'pill-coral', teachers: '96 teachers online', cat: 'Languages' },
    { name: 'Music & Craft', badge: 'Popular', pill: 'pill-gold', teachers: '142 teachers online', cat: 'Music' }
  ];

  return (
    <section className="categories-section">

        {/* Section content */}
      <div className="categories-feed">
        {categories.map((item, idx) => (
          <Link key={idx} className="glass-card category-card" to={`/browse?category=${item.cat}`}>
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