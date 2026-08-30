// src/components/BrowseSearch.jsx
import React from 'react';

export default function BrowseSearch({ 
  searchQuery, 
  onSearchChange,
  setSearchQuery, 
  selectedCategory, 
  onCategorySelect,
  setSelectedCategory,
  categories = ['All categories']
}) {
  const handleSearch = onSearchChange || setSearchQuery;
  const handleCategory = onCategorySelect || setSelectedCategory;

  const categoryList = Array.isArray(categories) && categories.length > 0
    ? categories
    : ['All categories'];

  return (
    <div className="glass-panel card-padding margin-bottom">
      <div className="browse-search-bar">
        <input
          className="form-input flex-1"
          type="text"
          placeholder="Search a skill — 'Photoshop', 'Spanish', 'guitar', 'React'..."
          value={searchQuery || ''}
          onChange={(e) => handleSearch && handleSearch(e.target.value)}
        />
        <span className="text-subtle">📍 Online + In-person</span>
        <button type="button" className="btn btn-primary btn-pill-sm">Search</button>
      </div>

      {/* Live Category Filter Chips from MongoDB */}
      <div className="filter-chips form-group-spaced">
        {categoryList.map((cat) => (
          <button
            type="button"
            key={cat}
            className={`pill-badge tag-margin-right ${selectedCategory === cat ? 'pill-violet' : 'pill-white'}`}
            onClick={() => handleCategory && handleCategory(cat)}
            style={{ cursor: 'pointer', border: 'none', font: 'inherit' }}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}