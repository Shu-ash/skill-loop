// src/admin/components/AdminSearchFilterBar.jsx
import React from 'react';

export default function AdminSearchFilterBar({
  searchQuery,
  onSearchChange,
  placeholder = "Search...",
  filters = [],
  onClearFilters
}) {
  const hasActiveFilters = searchQuery.trim() !== '' || filters.some(f => f.value && f.value !== f.options[0]);

  return (
    <div className="admin-filter-bar glass-panel clay-card-3d">
      <div className="admin-search-wrapper">
        <span className="admin-search-icon">🔍</span>
        <input
          type="text"
          className="admin-search-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
        />
        {searchQuery && (
          <button
            type="button"
            className="admin-search-clear-btn"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="admin-filter-controls">
        {filters.map((filter, idx) => (
          <div key={idx} className="admin-filter-group">
            {filter.label && <span className="admin-filter-label">{filter.label}:</span>}
            <select
              className="admin-filter-select"
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
            >
              {filter.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}

        {hasActiveFilters && onClearFilters && (
          <button
            type="button"
            className="admin-reset-filters-btn"
            onClick={onClearFilters}
            title="Reset all filters"
          >
            ↺ Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
