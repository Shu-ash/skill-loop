// src/pages/BrowsePage.jsx

import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import BrowseSearch from '../components/BrowseSearch';
import MemberCard from '../components/MemberCard';

const API_BASE_URL = 'http://localhost:5000/api';

const DEFAULT_PUBLIC_MEMBERS = [
  {
    id: 'm_1',
    name: 'Aarav Sharma',
    avatar: 'AS',
    avatarBg: 'var(--violet-primary)',
    title: 'Frontend React Developer & UI Specialist',
    rating: '⭐ 5.0 (24 reviews)',
    ratingValue: 5,
    skills: ['React', 'JavaScript', 'CSS Grid', 'Tailwind'],
    categories: ['Code & Data']
  },
  {
    id: 'm_2',
    name: 'Priya Verma',
    avatar: 'PV',
    avatarBg: 'var(--violet-primary)',
    title: 'Figma UI/UX Designer & Prototyper',
    rating: '⭐ 4.8 (18 reviews)',
    ratingValue: 4.8,
    skills: ['Figma', 'UI Design', 'Wireframing', 'User Research'],
    categories: ['Design']
  },
  {
    id: 'm_3',
    name: 'Rohan Gupta',
    avatar: 'RG',
    avatarBg: 'var(--violet-primary)',
    title: 'Full Stack Node.js & MongoDB Specialist',
    rating: '⭐ 5.0 (30 reviews)',
    ratingValue: 5,
    skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
    categories: ['Code & Data']
  },
  {
    id: 'm_4',
    name: 'Sneha Patel',
    avatar: 'SP',
    avatarBg: 'var(--violet-primary)',
    title: 'Spoken English & Communication Coach',
    rating: '⭐ 4.9 (15 reviews)',
    ratingValue: 4.9,
    skills: ['English', 'Public Speaking', 'Interview Prep'],
    categories: ['Languages']
  }
];

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
  if (text.includes('english') || text.includes('language') || text.includes('communication')) {
    return 'Languages';
  }
  if (text.includes('design') || text.includes('figma') || text.includes('photoshop') || text.includes('ui')) {
    return 'Design';
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

        if (response.ok && data?.data?.users?.length) {
          const formattedMembers = data.data.users.map((user) => {
            const skills = user.skillsCanTeach || [];
            return {
              id: user._id || user.id,
              name: user.name || 'SkillLoop Member',
              avatar: user.avatar || getInitials(user.name),
              avatarBg: 'var(--violet-primary)',
              title: user.headline || user.bio || 'SkillLoop Community Member 🚀',
              rating: `⭐ ${user.rating || '5.0'} (12 reviews)`,
              ratingValue: user.rating || 5,
              skills: skills.length ? skills : ['React', 'JavaScript'],
              categories: [getCategory(skills)],
              username: user.username || ''
            };
          });

          setMembers(formattedMembers);
        } else {
          setMembers(DEFAULT_PUBLIC_MEMBERS);
        }
      } catch (err) {
        console.log('Using default public members fallback:', err);
        setMembers(DEFAULT_PUBLIC_MEMBERS);
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
                  {loading
                    ? 'Finding members...'
                    : `${members.length} members ready to trade knowledge.`}
                </p>
              </div>
            </div>

            <BrowseSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            {loading && (
              <div className="glass-panel empty-browse-state">
                Loading live members...
              </div>
            )}

            {!loading && error && (
              <div className="glass-panel onboarding-error-banner">
                {error}
              </div>
            )}

            {!loading && !error && filteredMembers.length === 0 && (
              <div className="glass-panel empty-browse-state">
                No members found matching your search.
              </div>
            )}

            {!loading && !error && filteredMembers.length > 0 && (
              <div className="browse-grid">
                {filteredMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            )}
          </main>
        </div>

        <MobileNav />
      </div>
    </>
  );
}