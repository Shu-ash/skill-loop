// src/pages/BrowsePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import BrowseSearch from '../components/BrowseSearch';
import MemberCard from '../components/MemberCard';

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
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState(['All categories']);
  const [categoriesData, setCategoriesData] = useState([]);
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

  // Fetch live categories from MongoDB database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data?.categories)) {
          setCategoriesData(data.data.categories);
          const names = ['All categories', ...data.data.categories.map(c => c.name)];
          setCategories(names);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch live members from MongoDB database
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
              const skills = user.skillsCanTeach || [];
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

  const filteredMembers = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();

    // Find skills belonging to currently selected category
    const selectedCatObj = categoriesData.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
    const catSkills = selectedCatObj ? (selectedCatObj.skills || []).map(s => s.toLowerCase().trim()) : [];
    const catNameLower = selectedCategory.toLowerCase().trim();

    return members.filter((member) => {
      const memberSkillsLower = member.skills.map(s => s.toLowerCase().trim());

      const matchesCategory =
        selectedCategory === 'All categories' ||
        memberSkillsLower.some(ms => 
          catSkills.some(cs => cs.includes(ms) || ms.includes(cs)) ||
          ms.includes(catNameLower) ||
          catNameLower.includes(ms)
        );

      if (!searchLower) {
        return matchesCategory;
      }

      const matchesSearch =
        member.name.toLowerCase().includes(searchLower) ||
        member.title.toLowerCase().includes(searchLower) ||
        member.skills.some((skill) =>
          skill.toLowerCase().includes(searchLower)
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
                <h2>Browse the loop</h2>
                <p>
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
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              categories={categories}
            />

            <div className="browse-grid">
              {loading ? (
                <div className="glass-panel empty-requests-card" style={{ gridColumn: '1 / -1', padding: '3rem 1rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>⏳</span>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--slate-600)' }}>Loading live community members from MongoDB...</p>
                </div>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))
              ) : (
                <div className="glass-panel empty-requests-card" style={{ gridColumn: '1 / -1', padding: '3.5rem 1.5rem', textAlign: 'center', borderRadius: '24px' }}>
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>🔍</span>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: 'var(--slate-800)' }}>No Other Members Found</h3>
                  <p style={{ color: 'var(--slate-500)', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto', lineHeight: '1.6' }}>
                    {searchQuery ? `No members matched "${searchQuery}". Try searching for another skill.` : selectedCategory !== 'All categories' ? `No other members found offering skills in "${selectedCategory}".` : 'When other members or friends sign up, they will appear here!'}
                  </p>
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