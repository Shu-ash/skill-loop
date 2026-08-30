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

const getCategory = (skills = []) => {
  const text = skills.join(' ').toLowerCase();
  if (text.includes('english') || text.includes('language') || text.includes('communication') || text.includes('spanish') || text.includes('french')) {
    return 'Languages';
  }
  if (text.includes('design') || text.includes('figma') || text.includes('photoshop') || text.includes('ui') || text.includes('ux')) {
    return 'Design';
  }
  if (text.includes('music') || text.includes('guitar') || text.includes('piano') || text.includes('vocal')) {
    return 'Music';
  }
  return 'Code & Data';
};

export default function BrowsePage() {
  const [members, setMembers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const accessToken = localStorage.getItem('accessToken');

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
          const formattedMembers = data.data.users.map((user) => {
            const skills = user.skillsCanTeach || [];
            return {
              id: user._id || user.id,
              name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'SkillLoop Member',
              avatar: user.profilePhotoUrl || getInitials(user.name),
              profilePhotoUrl: user.profilePhotoUrl || '',
              avatarBg: 'var(--violet-primary)',
              title: user.headline || user.bio || 'SkillLoop Community Member 🚀',
              rating: `⭐ ${(user.rating || 5.0).toFixed(1)} (${user.ratingCount || 0} reviews)`,
              ratingValue: user.rating || 5,
              skills: skills.length ? skills : ['General Mentorship'],
              categories: [getCategory(skills)],
              username: user.username || ''
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
  }, [accessToken]);

  const filteredMembers = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();

    return members.filter((member) => {
      const matchesCategory =
        selectedCategory === 'All categories' ||
        member.categories.includes(selectedCategory);

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
  }, [members, selectedCategory, searchQuery]);

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
                  {members.length} {members.length === 1 ? 'member' : 'members'} ready to trade knowledge.
                </p>
              </div>
            </div>

            {error && (
              <div className="glass-panel onboarding-error-banner">
                {error}
              </div>
            )}

            <BrowseSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />

            <div className="browse-cards-grid">
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
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: 'var(--slate-800)' }}>No Members Found</h3>
                  <p style={{ color: 'var(--slate-500)', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto', lineHeight: '1.6' }}>
                    {searchQuery ? `No members matched "${searchQuery}". Try a different skill search.` : 'The database is currently clean. Be the first to register and teach a skill to the community!'}
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