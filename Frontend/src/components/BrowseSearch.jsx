// src/components/BrowseSearch.jsx
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { DEFAULT_CATEGORY_NAMES, MASTER_CATEGORIES } from '../data/categoriesData';
import './BrowseSearch.css';

import { API_BASE_URL } from '../config/api';

const getCategoryIcon = (category = '') => {
  const cat = String(typeof category === 'object' ? (category?.name || '') : (category || '')).toLowerCase();
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

const getCategoryString = (s = {}) => {
  if (!s) return 'General';
  if (typeof s.categoryName === 'string' && s.categoryName.trim()) return s.categoryName.trim();
  if (typeof s.category === 'string' && s.category.trim()) return s.category.trim();
  if (s.category && typeof s.category === 'object' && typeof s.category.name === 'string') {
    return s.category.name.trim();
  }
  return 'General';
};

const getSkillIcon = (s = {}) => {
  if (!s) return '⚡';
  if (s.category && typeof s.category === 'object' && typeof s.category.icon === 'string' && s.category.icon.trim()) {
    return s.category.icon.trim();
  }
  if (typeof s.icon === 'string' && s.icon.trim()) return s.icon.trim();
  return getCategoryIcon(getCategoryString(s));
};

const normalizeSkillItem = (s = {}) => ({
  name: String(s?.name || '').trim(),
  category: getCategoryString(s),
  icon: getSkillIcon(s),
  aliases: Array.isArray(s?.aliases) ? s.aliases.map((a) => String(a || '')) : []
});

// Build fallback catalog from MASTER_CATEGORIES
const FALLBACK_CATALOG = [];
const seenFallback = new Set();
MASTER_CATEGORIES.forEach((cat) => {
  (cat.skills || []).forEach((skillName) => {
    const key = skillName.toLowerCase();
    if (!seenFallback.has(key)) {
      seenFallback.add(key);
      FALLBACK_CATALOG.push({
        name: skillName,
        category: cat.name,
        icon: cat.icon || '⚡',
        aliases: []
      });
    }
  });
});

export default function BrowseSearch({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  categories = DEFAULT_CATEGORY_NAMES,
  members = [],
  dbSkills = []
}) {
  const scrollContainerRef = useRef(null);
  const activeChipRef = useRef(null);
  const searchWrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Live Search Autocomplete State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [catalogSkills, setCatalogSkills] = useState(FALLBACK_CATALOG);
  const [remoteMatchedSkills, setRemoteMatchedSkills] = useState(null);
  const [isSearchingBackend, setIsSearchingBackend] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Sync catalogSkills with dbSkills prop or fetch from backend
  useEffect(() => {
    if (Array.isArray(dbSkills) && dbSkills.length > 0) {
      setCatalogSkills(dbSkills.map(normalizeSkillItem).filter((s) => s.name));
      return;
    }

    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/skills?limit=200`);
        const data = await res.json();
        if (isMounted && res.ok && data.success && Array.isArray(data.data?.skills) && data.data.skills.length > 0) {
          setCatalogSkills(
            data.data.skills.map(normalizeSkillItem).filter((s) => s.name)
          );
        }
      } catch (err) {
        // Fallback already populated
      }
    };
    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, [dbSkills]);

  // Live debounced backend search on `/api/skills?search=...`
  useEffect(() => {
    const q = (searchQuery || '').trim();
    if (!q) {
      setRemoteMatchedSkills(null);
      setIsSearchingBackend(false);
      return;
    }

    let isCancelled = false;
    setIsSearchingBackend(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/skills?search=${encodeURIComponent(q)}&limit=10`);
        const data = await res.json();
        if (!isCancelled && res.ok && data.success && Array.isArray(data.data?.skills)) {
          setRemoteMatchedSkills(
            data.data.skills.map(normalizeSkillItem).filter((s) => s.name)
          );
        }
      } catch (err) {
        if (!isCancelled) setRemoteMatchedSkills(null);
      } finally {
        if (!isCancelled) setIsSearchingBackend(false);
      }
    }, 130);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Close live search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Count how many members teach each skill
  const skillTeacherCounts = useMemo(() => {
    const counts = new Map();
    members.forEach((m) => {
      (m.skills || []).forEach((s) => {
        const key = String(s || '').trim().toLowerCase();
        if (key && key !== 'community member') {
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      });
    });
    return counts;
  }, [members]);

  // Popular / trending skills for empty-query focus state
  const popularSkills = useMemo(() => {
    const withCounts = catalogSkills.map((item) => {
      const normalized = normalizeSkillItem(item);
      return {
        ...normalized,
        teacherCount: skillTeacherCounts.get(normalized.name.toLowerCase()) || 0
      };
    });
    withCounts.sort((a, b) => {
      if (b.teacherCount !== a.teacherCount) return b.teacherCount - a.teacherCount;
      return a.name.localeCompare(b.name);
    });
    return withCounts.slice(0, 10);
  }, [catalogSkills, skillTeacherCounts]);

  // Compute live matching skills for current searchQuery
  const matchingSkills = useMemo(() => {
    const q = String(searchQuery || '').trim().toLowerCase();
    if (!q) return [];

    // Local ranked matches
    const localRanked = catalogSkills
      .map(normalizeSkillItem)
      .filter((item) => {
        if (!item.name) return false;
        const nameLower = item.name.toLowerCase();
        const catLower = item.category.toLowerCase();
        const aliasMatch =
          Array.isArray(item.aliases) &&
          item.aliases.some((a) => {
            const al = String(a || '').toLowerCase();
            return al && (al.includes(q) || q.includes(al));
          });
        return nameLower.includes(q) || catLower.includes(q) || aliasMatch;
      })
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        if (aName === q && bName !== q) return -1;
        if (bName === q && aName !== q) return 1;
        if (aName.startsWith(q) && !bName.startsWith(q)) return -1;
        if (bName.startsWith(q) && !aName.startsWith(q)) return 1;
        const aCount = skillTeacherCounts.get(aName) || 0;
        const bCount = skillTeacherCounts.get(bName) || 0;
        if (bCount !== aCount) return bCount - aCount;
        return aName.localeCompare(bName);
      });

    // Merge remote + local without duplicates
    const combined = [];
    const seen = new Set();
    const addSkill = (rawSkill) => {
      const s = normalizeSkillItem(rawSkill);
      if (!s.name) return;
      const key = s.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push({
          ...s,
          teacherCount: skillTeacherCounts.get(key) || 0
        });
      }
    };

    if (Array.isArray(remoteMatchedSkills)) {
      remoteMatchedSkills.forEach(addSkill);
    }
    localRanked.forEach(addSkill);

    return combined.slice(0, 8);
  }, [searchQuery, catalogSkills, remoteMatchedSkills, skillTeacherCounts]);

  // Compute live matching categories
  const matchingCategories = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return [];
    return categories
      .filter((cat) => cat !== 'All categories' && cat.toLowerCase().includes(q))
      .slice(0, 3);
  }, [searchQuery, categories]);

  // Compute live matching members (by name, username, title, or canonical matched skill)
  const matchingMembers = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return [];

    const matchedSkillNamesLower = new Set(matchingSkills.map((s) => s.name.toLowerCase()));

    return members
      .filter((member) => {
        const nameMatch = (member.name || '').toLowerCase().includes(q);
        const userMatch = (member.username || '').toLowerCase().includes(q);
        const titleMatch = (member.title || '').toLowerCase().includes(q);
        const skillMatch = (member.skills || []).some((sk) => {
          const skLower = (sk || '').toLowerCase();
          return skLower.includes(q) || matchedSkillNamesLower.has(skLower);
        });
        return nameMatch || userMatch || titleMatch || skillMatch;
      })
      .slice(0, 4);
  }, [searchQuery, members, matchingSkills]);

  // Build flat navigable items list for keyboard navigation
  const navigableItems = useMemo(() => {
    const q = (searchQuery || '').trim();
    if (!q) {
      return popularSkills.map((s) => ({ type: 'skill', value: s.name, data: s }));
    }
    const items = [];
    matchingSkills.forEach((s) => items.push({ type: 'skill', value: s.name, data: s }));
    matchingCategories.forEach((c) => items.push({ type: 'category', value: c, data: c }));
    matchingMembers.forEach((m) => items.push({ type: 'member', value: m.name, data: m }));
    return items;
  }, [searchQuery, popularSkills, matchingSkills, matchingCategories, matchingMembers]);

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

  const handleSelectSkillSuggestion = (skillName) => {
    onSearchChange(skillName);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSelectCategorySuggestion = (categoryName) => {
    onCategorySelect(categoryName);
    onSearchChange('');
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSelectMemberSuggestion = (member) => {
    onSearchChange(member.name);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex((prev) =>
        navigableItems.length ? (prev + 1) % navigableItems.length : -1
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex((prev) =>
        navigableItems.length ? (prev - 1 + navigableItems.length) % navigableItems.length : -1
      );
    } else if (e.key === 'Enter') {
      if (isDropdownOpen && highlightedIndex >= 0 && highlightedIndex < navigableItems.length) {
        e.preventDefault();
        const item = navigableItems[highlightedIndex];
        if (item.type === 'skill') handleSelectSkillSuggestion(item.value);
        else if (item.type === 'category') handleSelectCategorySuggestion(item.value);
        else if (item.type === 'member') handleSelectMemberSuggestion(item.data);
      } else {
        setIsDropdownOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const hasQuery = Boolean((searchQuery || '').trim());
  const totalMatchesCount = matchingSkills.length + matchingCategories.length + matchingMembers.length;

  return (
    <div className={`glass-panel card-padding browse-search-box ${isDropdownOpen ? 'dropdown-open' : ''}`}>
      {/* Top Search & Action Bar */}
      <div className="browse-search-bar" ref={searchWrapperRef}>
        <div className="search-input-wrapper">
          <span className="search-leading-icon">🔍</span>
          <input
            ref={searchInputRef}
            className="form-input search-main-input"
            type="text"
            placeholder="Live search skills or mentors — 'React JS', 'Python', 'Figma', 'Guitar'..."
            value={searchQuery}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setIsDropdownOpen(true);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {isSearchingBackend && (
            <span className="browse-live-search-spinner" title="Searching database...">
              ⏳
            </span>
          )}
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                onSearchChange('');
                setHighlightedIndex(-1);
                searchInputRef.current?.focus();
              }}
              title="Clear search"
              aria-label="Clear search input"
            >
              ✕
            </button>
          )}

          {/* LIVE SEARCH AUTOCOMPLETE DROPDOWN */}
          {isDropdownOpen && (
            <div className="browse-live-dropdown" role="listbox">
              {!hasQuery ? (
                /* Empty Query State: Popular Database Skills + Quick Categories */
                <div className="browse-live-section">
                  <div className="browse-live-header">
                    <span>🔥 Popular Skills in Database</span>
                    <span className="browse-live-badge">{catalogSkills.length} verified skills</span>
                  </div>
                  <div className="browse-live-SkillsGrid">
                    {popularSkills.map((item, idx) => (
                      <button
                        key={item.name}
                        type="button"
                        className={`browse-live-skill-pill ${idx === highlightedIndex ? 'highlighted' : ''}`}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSkillSuggestion(item.name);
                        }}
                      >
                        <span className="browse-live-pill-icon">{item.icon || '⚡'}</span>
                        <span className="browse-live-pill-name">{item.name}</span>
                        {item.teacherCount > 0 && (
                          <span className="browse-live-pill-count">{item.teacherCount}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : totalMatchesCount > 0 ? (
                <>
                  {/* 1. Matching Database Skills */}
                  {matchingSkills.length > 0 && (
                    <div className="browse-live-section">
                      <div className="browse-live-header">
                        <span>⚡ Matching Database Skills ({matchingSkills.length})</span>
                        <span>Click to filter</span>
                      </div>
                      {matchingSkills.map((item, idx) => {
                        const navIdx = idx;
                        const isHighlighted = navIdx === highlightedIndex;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            className={`browse-live-row ${isHighlighted ? 'highlighted' : ''}`}
                            onMouseEnter={() => setHighlightedIndex(navIdx)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectSkillSuggestion(item.name);
                            }}
                          >
                            <div className="browse-live-row-left">
                              <span className="browse-live-row-icon">{item.icon || '⚡'}</span>
                              <div>
                                <div className="browse-live-row-title">{item.name}</div>
                                <div className="browse-live-row-sub">{item.category}</div>
                              </div>
                            </div>
                            <div className="browse-live-row-right">
                              {item.teacherCount > 0 ? (
                                <span className="browse-live-mentor-count">
                                  👤 {item.teacherCount} {item.teacherCount === 1 ? 'mentor' : 'mentors'}
                                </span>
                              ) : (
                                <span className="browse-live-verified-tag">✓ Verified Skill</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. Matching Categories */}
                  {matchingCategories.length > 0 && (
                    <div className="browse-live-section">
                      <div className="browse-live-header">
                        <span>📂 Matching Categories</span>
                        <span>Filter category</span>
                      </div>
                      {matchingCategories.map((cat, idx) => {
                        const navIdx = matchingSkills.length + idx;
                        const isHighlighted = navIdx === highlightedIndex;
                        return (
                          <button
                            key={cat}
                            type="button"
                            className={`browse-live-row ${isHighlighted ? 'highlighted' : ''}`}
                            onMouseEnter={() => setHighlightedIndex(navIdx)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectCategorySuggestion(cat);
                            }}
                          >
                            <div className="browse-live-row-left">
                              <span className="browse-live-row-icon">{getCategoryIcon(cat)}</span>
                              <div>
                                <div className="browse-live-row-title">{cat}</div>
                                <div className="browse-live-row-sub">Skill Category</div>
                              </div>
                            </div>
                            <span className="browse-live-verified-tag">Filter Category →</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 3. Matching Community Mentors */}
                  {matchingMembers.length > 0 && (
                    <div className="browse-live-section">
                      <div className="browse-live-header">
                        <span>👥 Matching Community Members ({matchingMembers.length})</span>
                        <span>View member</span>
                      </div>
                      {matchingMembers.map((member, idx) => {
                        const navIdx = matchingSkills.length + matchingCategories.length + idx;
                        const isHighlighted = navIdx === highlightedIndex;
                        return (
                          <button
                            key={member.id || member.name}
                            type="button"
                            className={`browse-live-row ${isHighlighted ? 'highlighted' : ''}`}
                            onMouseEnter={() => setHighlightedIndex(navIdx)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectMemberSuggestion(member);
                            }}
                          >
                            <div className="browse-live-row-left">
                              <span className="browse-live-avatar">
                                {member.profilePhotoUrl ? (
                                  <img src={member.profilePhotoUrl} alt={member.name} />
                                ) : (
                                  (member.name || 'SL').slice(0, 2).toUpperCase()
                                )}
                              </span>
                              <div>
                                <div className="browse-live-row-title">
                                  {member.name}{' '}
                                  {member.username && (
                                    <span className="browse-live-username">
                                      @{member.username.replace(/^@/, '')}
                                    </span>
                                  )}
                                </div>
                                <div className="browse-live-row-sub">
                                  Teaches: {(member.skills || []).slice(0, 3).join(', ')}
                                </div>
                              </div>
                            </div>
                            <span className="browse-live-mentor-rating">{member.rating?.split(' ')[0] || '⭐'}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                /* No Match in Database State */
                <div className="browse-live-empty">
                  <div className="browse-live-empty-title">
                    ⚠️ No database skill or member matches &ldquo;{searchQuery.trim()}&rdquo;
                  </div>
                  <div className="browse-live-empty-sub">
                    Try picking one of our verified platform skills below:
                  </div>
                  <div className="browse-live-SkillsGrid" style={{ marginTop: '0.6rem' }}>
                    {popularSkills.slice(0, 6).map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        className="browse-live-skill-pill"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSkillSuggestion(item.name);
                        }}
                      >
                        <span className="browse-live-pill-icon">{item.icon || '⚡'}</span>
                        <span className="browse-live-pill-name">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn btn-primary btn-pill-sm browse-search-action-btn"
          onClick={() => setIsDropdownOpen(false)}
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
