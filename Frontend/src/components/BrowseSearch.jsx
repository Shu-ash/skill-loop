// src/components/BrowseSearch.jsx

import React from 'react';
export default function BrowseSearch({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory 
}) {
    // Categories for filtering
  const categories = ['All categories', 'Design', 'Code & Data', 'Languages', 'Music', 'Cooking'];

  return (
    <div className="glass-panel card-padding">
      <div className="browse-search-bar">
        <input
          className="form-input flex-1"
          type="text"
          placeholder="Search a skill — 'Photoshop', 'Spanish', 'guitar'..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="text-subtle">📍 Online + In-person</span>
        <button className="btn btn-primary btn-pill-sm">Search</button>
      </div>

      {/* Category filter */}
      <div className="filter-chips" style={{ marginTop: '0.85rem' }}>
        {categories.map((cat) => (
          <span
            key={cat}
            className={`pill-badge cursor-pointer ${selectedCategory === cat ? 'pill-violet' : 'pill-white'}`}
            style={{ cursor: 'pointer', marginRight: '0.4rem' }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}