// src/components/BrowseSearch.jsx
import React from 'react';

const getCategoryIcon = (category = '') => {
  const cat = category.toLowerCase();
  if (cat.includes('all')) return '✨';
  if (cat.includes('code') || cat.includes('tech') || cat.includes('dev')) return '💻';
  if (cat.includes('design') || cat.includes('art') || cat.includes('ui')) return '🎨';
  if (cat.includes('language') || cat.includes('study') || cat.includes('speak')) return '🗣️';
  if (cat.includes('ai') || cat.includes('data') || cat.includes('machine')) return '🤖';
  if (cat.includes('music') || cat.includes('audio')) return '🎵';
  if (cat.includes('business') || cat.includes('market') || cat.includes('growth')) return '📈';
  if (cat.includes('life') || cat.includes('fitness') || cat.includes('cook') || cat.includes('health')) return '🌿';
  return '⚡';
};

export default function BrowseSearch({ 
  searchQuery, 
  onSearchChange, 
  selectedCategory, 
  onCategorySelect,
  categories = ['All categories', 'Design & UI', 'Code & Data', 'Languages', 'Music & Arts', 'Marketing & Growth']
}) {
  return (
    <div className="glass-panel card-padding browse-search-box">
      <div className="browse-search-bar">
        <input
          className="form-input flex-1"
          type="text"
          placeholder="Search a skill — 'Photoshop', 'Spanish', 'guitar'..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <span className="text-subtle">📍 Online + In-person</span>
        <button type="button" className="btn btn-primary btn-pill-sm">Search</button>
      </div>

      {/* Modern Horizontal Category Filter Chips */}
      <div className="category-filters-wrapper">
        <div className="category-filters-list">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`category-filter-chip ${isSelected ? 'active' : ''}`}
                onClick={() => onCategorySelect(cat)}
              >
                <span className="category-chip-icon">{getCategoryIcon(cat)}</span>
                <span className="category-chip-text">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
