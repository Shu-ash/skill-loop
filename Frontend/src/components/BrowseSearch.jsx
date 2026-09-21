// src/components/BrowseSearch.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DEFAULT_CATEGORY_NAMES } from '../data/categoriesData';
import './BrowseSearch.css';

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
  categories = DEFAULT_CATEGORY_NAMES
}) {
  const scrollContainerRef = useRef(null);
  const activeChipRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position to dynamically show/hide navigation arrows
  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScroll();

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, categories]);

  // Smoothly center the active chip in the carousel viewport
  useEffect(() => {
    if (activeChipRef.current) {
      activeChipRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [selectedCategory]);

  const handleScroll = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -280 : 280;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 320);
  };

  return (
    <div className="glass-panel card-padding browse-search-box">
      {/* Top Search & Action Bar */}
      <div className="browse-search-bar">
        <div className="search-input-wrapper">
          <span className="search-leading-icon">🔍</span>
          <input
            className="form-input search-main-input"
            type="text"
            placeholder="Search a skill — 'Photoshop', 'Python', 'Guitar', 'English'..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              className="search-clear-btn" 
              onClick={() => onSearchChange('')}
              title="Clear search"
              aria-label="Clear search input"
            >
              ✕
            </button>
          )}
        </div>

        <button 
          type="button" 
          className="btn btn-primary btn-pill-sm browse-search-action-btn"
          onClick={() => {
            // Keep focus or submit action
          }}
        >
          Explore
        </button>
      </div>

      {/* Modern Horizontal Category Slider with Left & Right Arrow Navigation */}
      <div className="category-filters-container">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            type="button"
            className="category-scroll-btn scroll-btn-left"
            onClick={() => handleScroll('left')}
            aria-label="Scroll categories left"
            title="Previous categories"
          >
            ‹
          </button>
        )}

        {/* Left Gradient Fade Mask */}
        <div className={`category-fade-mask fade-left ${canScrollLeft ? 'visible' : ''}`} />

        {/* Category Chips Scroll Track */}
        <div 
          className="category-filters-list"
          ref={scrollContainerRef}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                ref={isSelected ? activeChipRef : null}
                type="button"
                className={`category-filter-chip ${isSelected ? 'active' : ''}`}
                onClick={() => onCategorySelect(cat)}
              >
                <span className="category-chip-icon">{getCategoryIcon(cat)}</span>
                <span className="category-chip-text">{cat}</span>
                {isSelected && cat !== 'All categories' && (
                  <span 
                    className="category-chip-clear" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onCategorySelect('All categories');
                    }}
                    title="Reset to All categories"
                  >
                    ✕
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Gradient Fade Mask */}
        <div className={`category-fade-mask fade-right ${canScrollRight ? 'visible' : ''}`} />

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            type="button"
            className="category-scroll-btn scroll-btn-right"
            onClick={() => handleScroll('right')}
            aria-label="Scroll categories right"
            title="More categories"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
