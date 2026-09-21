// src/pages/BrowsePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import BrowseSearch from '../components/BrowseSearch';
import MemberCard from '../components/MemberCard';
import SkillLoopLoader from '../components/SkillLoopLoader';
import { 
  DEFAULT_CATEGORY_NAMES, 
  MASTER_CATEGORIES, 
  isMemberMatchingCategory 
} from '../data/categoriesData';

const API_BASE_URL = 'http://localhost:5000/api';

const getInitials = (name = '') => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return initials || 'SL';
};

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORY_NAMES);
  const [categoriesData, setCategoriesData] = useState(MASTER_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const accessToken = localStorage.getItem('accessToken');

  const currentStoredUser = useMemo(() => {
    try {
      const stored = localStorage.getItem('skillloop_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, []);

  // Sync category and search query from URL search params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const qParam = searchParams.get('q') || searchParams.get('search');

    if (categoryParam) {
      const catLower = categoryParam.toLowerCase().trim();
      const matched = MASTER_CATEGORIES.find(c => 
        c.name.toLowerCase() === catLower ||
        c.name.toLowerCase().includes(catLower) ||
        catLower.includes(c.name.toLowerCase()) ||
        (c.keywords && c.keywords.some(kw => catLower.includes(kw) || kw.includes(catLower)))
      );
      if (matched) {
        setSelectedCategory(matched.name);
      } else {
        setSelectedCategory(categoryParam);
      }
    } else {
      setSelectedCategory('All categories');
    }

    if (qParam) {
      setSearchQuery(qParam);
    }
  }, [searchParams]);

  // Fetch live categories from MongoDB database (if any) and merge with master categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data?.categories) && data.data.categories.length > 0) {
          const liveCats = data.data.categories;
          setCategoriesData(liveCats);
          const liveNames = liveCats.map(c => c.name);
          const allUniqueNames = Array.from(new Set(['All categories', ...liveNames, ...DEFAULT_CATEGORY_NAMES.slice(1)]));
          setCategories(allUniqueNames);
        }
      } catch (err) {
        console.error('Failed to load live categories in BrowsePage:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError('');

        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'GET',
          headers,
          credentials: 'include'
        });

        const data = await response.json();

        if (response.ok && Array.isArray(data?.data?.users)) {
          const currentId = currentStoredUser?._id || currentStoredUser?.id || currentStoredUser?.userId;
          const currentEmail = (currentStoredUser?.email || '').toLowerCase();
          const currentUsername = (currentStoredUser?.username || '').replace(/^@/, '').toLowerCase();

          const formattedMembers = data.data.users
            .filter((u) => {
              const uId = u._id || u.id;
              const uEmail = (u.email || '').toLowerCase();
              const uUsername = (u.username || '').replace(/^@/, '').toLowerCase();

              // ALWAYS Exclude logged-in user themselves
              if (currentId && String(uId) === String(currentId)) return false;
              if (currentEmail && uEmail && uEmail === currentEmail) return false;
              if (currentUsername && uUsername && uUsername === currentUsername) return false;
              return true;
            })
            .map((user) => {
              const skills = Array.isArray(user.skillsCanTeach) && user.skillsCanTeach.length
                ? user.skillsCanTeach
                : Array.isArray(user.teachSkills) && user.teachSkills.length
                  ? user.teachSkills
                  : [];
              return {
                id: user._id || user.id,
                name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'SkillLoop Member',
                avatar: user.profilePhotoUrl || getInitials(user.name),
                profilePhotoUrl: user.profilePhotoUrl || '',
                avatarBg: 'var(--violet-primary)',
                title: user.headline || user.bio || 'SkillLoop Community Member 🚀',
                rating: `⭐ ${(user.rating || 0).toFixed(1)} (${user.ratingCount || 0} reviews)`,
                ratingValue: user.rating || 0,
                skills: skills.length ? skills : ['Community Member'],
                categories: Array.isArray(user.categories) ? user.categories : [],
                username: user.username || '',
                email: user.email || ''
              };
            });

          setMembers(formattedMembers);
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.log('Error fetching live members from database:', err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [accessToken, currentStoredUser]);

  // Handler for category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All categories') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams, { replace: true });
  };

  // Handler for search query change
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (!val.trim()) {
      newParams.delete('q');
    } else {
      newParams.set('q', val.trim());
    }
    setSearchParams(newParams, { replace: true });
  };

  // Safe and reactive member filter
  const filteredMembers = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();

    return members.filter((member) => {
      // Safe Category matching using robust helper
      const matchesCategory = isMemberMatchingCategory(member, selectedCategory, categoriesData);

      if (!searchLower) {
        return matchesCategory;
      }

      const memberSkills = Array.isArray(member.skills) ? member.skills : [];
      const matchesSearch =
        (member.name || '').toLowerCase().includes(searchLower) ||
        (member.title || '').toLowerCase().includes(searchLower) ||
        (member.username || '').toLowerCase().includes(searchLower) ||
        memberSkills.some((skill) =>
          (skill || '').toLowerCase().includes(searchLower)
        );

      return matchesCategory && matchesSearch;
    });
  }, [members, selectedCategory, searchQuery, categoriesData]);

  return (
    <>
      <div className="liquid-bg">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
      </div>

      <div id="app">
        <Navbar />

        <div className="app-layout">
          <Sidebar />

          <main className="main-content">
            <div className="page-title-row">
              <div>
                <h1 className="page-title" style={{ fontSize: 'var(--text-3xl, 2rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Browse the loop
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm, 0.875rem)' }}>
                  {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'} ready to trade knowledge.
                </p>
              </div>
            </div>

            {error && (
              <div className="glass-panel onboarding-error-banner">
                {error}
              </div>
            )}

            {/* Dynamic Search & Live Categories Filter */}
            <BrowseSearch
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              categories={categories}
            />

            <div className="browse-grid">
              {loading ? (
                <div className="grid-col-full">
                  <SkillLoopLoader
                    title="Loading Community Members"
                    subtitle="Connecting to MongoDB skill directory & live member profiles..."
                    badgeText="MongoDB Live Sync"
                    variant="card"
                  />
                </div>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))
              ) : (
                <div className="glass-panel empty-requests-card empty-card-full" style={{ padding: '52px 24px', textAlign: 'center' }}>
                  <span className="empty-card-icon" style={{ fontSize: '4.5rem', display: 'block', marginBottom: '16px', lineHeight: 1 }}>🔍</span>
                  <h2 className="empty-card-title" style={{ fontSize: 'var(--text-2xl, 1.5rem)', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 800 }}>No Other Members Found</h2>
                  <p className="empty-card-desc" style={{ maxWidth: '460px', margin: '0 auto 24px', fontSize: 'var(--text-base, 1rem)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {searchQuery ? `No members matched "${searchQuery}". Try searching for another skill or clearing your search query.` : selectedCategory !== 'All categories' ? `No other members found offering skills in "${selectedCategory}".` : 'When other members or friends sign up, they will appear here!'}
                  </p>
                  {(selectedCategory !== 'All categories' || searchQuery) && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-pill-sm"
                      onClick={() => {
                        handleCategorySelect('All categories');
                        handleSearchChange('');
                      }}
                      style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>🔄</span>
                      <span>Show all members</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>

        <MobileNav />
      </div>
    </>
  );
}