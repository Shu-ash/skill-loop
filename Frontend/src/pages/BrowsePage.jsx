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

const getRatingStars = (rating) => {
  const value = Number(rating);

  if (!Number.isFinite(value) || value <= 0) {
    return '☆☆☆☆☆';
  }

  const rounded = Math.round(value);

  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
};

const getCategory = (skills = []) => {
  const text = skills.join(' ').toLowerCase();

  if (
    text.includes('english') ||
    text.includes('language') ||
    text.includes('communication')
  ) {
    return 'Languages';
  }

  if (
    text.includes('design') ||
    text.includes('figma') ||
    text.includes('photoshop') ||
    text.includes('ui')
  ) {
    return 'Design';
  }

  return 'Code & Data';
};

export default function BrowsePage() {
  const [members, setMembers] = useState([]);
  const [selectedCategory, setSelectedCategory] =
    useState('All categories');
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const accessToken =
    localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchMembers = async () => {
      if (!accessToken) {
        setError('Please login to browse members.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_BASE_URL}/users`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            credentials: 'include'
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            'Unable to load members.'
          );
        }

        const users =
          data?.data?.users ||
          data?.data ||
          data?.users ||
          [];

        const formattedMembers = users.map(
          (user) => {
            const skills =
              user.skillsCanTeach || [];

            const rating =
              Number(user.rating) || 0;

            return {
              id: user._id || user.id,

              name:
                user.name ||
                'SkillLoop Member',

              avatar:
                user.avatar ||
                getInitials(user.name),

              avatarBg:
                'var(--violet-primary)',

              title:
                user.headline ||
                user.bio ||
                'SkillLoop member',

              rating:
                getRatingStars(rating),

              ratingValue: rating,

              skills,

              categories: [
                getCategory(skills)
              ],

              username:
                user.username || ''
            };
          }
        );

        setMembers(formattedMembers);
      } catch (err) {
        console.error(
          'Browse members error:',
          err
        );

        setError(
          err.message ||
          'Unable to load members.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [accessToken]);

  const filteredMembers = useMemo(() => {
    const searchLower =
      searchQuery.trim().toLowerCase();

    return members.filter((member) => {
      const matchesCategory =
        selectedCategory ===
        'All categories' ||
        member.categories.includes(
          selectedCategory
        );

      if (!searchLower) {
        return matchesCategory;
      }

      const matchesSearch =
        member.name
          .toLowerCase()
          .includes(searchLower) ||

        member.title
          .toLowerCase()
          .includes(searchLower) ||

        member.skills.some((skill) =>
          skill
            .toLowerCase()
            .includes(searchLower)
        );

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [
    members,
    selectedCategory,
    searchQuery
  ]);

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
                <h2>
                  Browse the loop
                </h2>

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
              selectedCategory={
                selectedCategory
              }
              setSelectedCategory={
                setSelectedCategory
              }
            />

            {loading && (
              <div
                className="glass-panel"
                style={{
                  padding: '2rem',
                  textAlign: 'center'
                }}
              >
                Loading members...
              </div>
            )}

            {!loading && error && (
              <div
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  color: 'var(--coral-primary)'
                }}
              >
                {error}
              </div>
            )}

            {!loading &&
              !error &&
              filteredMembers.length === 0 && (
                <div
                  className="glass-panel"
                  style={{
                    padding: '2rem',
                    textAlign: 'center'
                  }}
                >
                  No members found.
                </div>
              )}

            {!loading &&
              !error &&
              filteredMembers.length > 0 && (
                <div className="browse-grid">
                  {filteredMembers.map(
                    (member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                      />
                    )
                  )}
                </div>
              )}

          </main>
        </div>

        <MobileNav />
      </div>
    </>
  );
}