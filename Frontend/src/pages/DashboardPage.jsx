// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import WelcomeBanner from '../components/WelcomeBanner';
import KpiStatsGrid from '../components/KpiStatsGrid';
import RecommendedMatchesSection from '../components/RecommendedMatchesSection';
import EditProfileModal from '../components/EditProfileModal';
import { fetchWithAuth, getAuthStatus } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5000/api';

export default function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('skillloop_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        return {
          id: u._id || u.id,
          name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Member',
          username: u.username ? `@${u.username.replace(/^@/, '')}` : '@user',
          teachSkills: Array.isArray(u.skillsCanTeach) ? u.skillsCanTeach : [],
          learnSkills: Array.isArray(u.skillsWantToLearn) ? u.skillsWantToLearn : [],
          skillsCanTeach: Array.isArray(u.skillsCanTeach) ? u.skillsCanTeach : [],
          skillsWantToLearn: Array.isArray(u.skillsWantToLearn) ? u.skillsWantToLearn : [],
          headline: u.headline || '',
          bio: u.bio || '',
          credits: u.credits ?? 10
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: 'Member',
      username: '@user',
      teachSkills: [],
      learnSkills: [],
      skillsCanTeach: [],
      skillsWantToLearn: [],
      headline: '',
      bio: '',
      credits: 10
    };
  });

  const [stats, setStats] = useState({
    credits: 0,
    activeSwaps: 0,
    rating: '5.0',
    sessionsTaught: 0
  });

  const [matchesData, setMatchesData] = useState({
    recommendations: [],
    mutualMatches: [],
    learnMatches: [],
    teachMatches: [],
    similarMatches: []
  });

  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Welcome back');
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    const { isAuthenticated } = getAuthStatus();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const [userRes, statsRes, recsRes] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/users/me`),
        fetchWithAuth(`${API_BASE_URL}/users/dashboard-stats`),
        fetchWithAuth(`${API_BASE_URL}/matches/recommendations`)
      ]);

      const userData = await userRes.json();
      const statsData = await statsRes.json();
      const recsData = await recsRes.json();

      let loggedInUserId = null;
      let loggedInEmail = null;

      if (userRes.ok && userData.data?.user) {
        const backendUser = userData.data.user;
        loggedInUserId = backendUser._id || backendUser.id;
        loggedInEmail = backendUser.email?.toLowerCase();
        const fullName = backendUser.name || `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() || 'Member';
        const updatedUser = {
          id: loggedInUserId,
          name: fullName,
          username: backendUser.username ? `@${backendUser.username.replace(/^@/, '')}` : '@user',
          teachSkills: Array.isArray(backendUser.skillsCanTeach) ? backendUser.skillsCanTeach : [],
          learnSkills: Array.isArray(backendUser.skillsWantToLearn) ? backendUser.skillsWantToLearn : [],
          skillsCanTeach: Array.isArray(backendUser.skillsCanTeach) ? backendUser.skillsCanTeach : [],
          skillsWantToLearn: Array.isArray(backendUser.skillsWantToLearn) ? backendUser.skillsWantToLearn : [],
          headline: backendUser.headline || '',
          bio: backendUser.bio || '',
          credits: backendUser.credits ?? 10
        };
        setUser(updatedUser);
        localStorage.setItem('skillloop_user', JSON.stringify({ ...backendUser, name: fullName }));
      }

      if (statsRes.ok && statsData.data) {
        setStats(statsData.data);
      }

      if (recsRes.ok && recsData.data) {
        const {
          recommendations = [],
          mutualMatches = [],
          learnMatches = [],
          teachMatches = [],
          similarMatches = []
        } = recsData.data;

        const filterSelf = (list) =>
          list.filter((m) => {
            const mId = m.id || m._id;
            const mEmail = (m.email || '').toLowerCase();
            if (loggedInUserId && String(mId) === String(loggedInUserId)) return false;
            if (loggedInEmail && mEmail === loggedInEmail) return false;
            return true;
          });

        setMatchesData({
          recommendations: filterSelf(recommendations),
          mutualMatches: filterSelf(mutualMatches),
          learnMatches: filterSelf(learnMatches),
          teachMatches: filterSelf(teachMatches),
          similarMatches: filterSelf(similarMatches)
        });
      } else {
        // Fallback live users from directory
        const usersRes = await fetchWithAuth(`${API_BASE_URL}/users`);
        const usersData = await usersRes.json();
        if (usersRes.ok && usersData.data?.users?.length) {
          const fallback = usersData.data.users
            .filter((u) => {
              const uId = u.id || u._id;
              const uEmail = (u.email || '').toLowerCase();
              if (loggedInUserId && String(uId) === String(loggedInUserId)) return false;
              if (loggedInEmail && uEmail === loggedInEmail) return false;
              return true;
            })
            .map((u) => ({
              id: u.id || u._id,
              name: u.name,
              avatar: (u.name || 'SL').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'SL',
              title: u.headline || 'SkillLoop Member',
              skillsCanTeach: u.skillsCanTeach || [],
              skillsWantToLearn: u.skillsWantToLearn || [],
              teachSkills: u.skillsCanTeach || [],
              learnSkills: u.skillsWantToLearn || [],
              rating: typeof u.rating === 'number' ? `⭐ ${u.rating.toFixed(1)}` : '⭐ 5.0'
            }));
          setMatchesData({
            recommendations: fallback,
            mutualMatches: [],
            learnMatches: [],
            teachMatches: [],
            similarMatches: []
          });
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }

    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSaveProfile = async (updatedFields) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(updatedFields)
      });

      const data = await res.json();
      if (res.ok && data.data?.user) {
        setShowEditModal(false);
        fetchDashboardData();
      }
    } catch (e) {
      console.error('Error saving profile:', e);
    }
  };

  const teachSkillsList = user.skillsCanTeach?.length ? user.skillsCanTeach : user.teachSkills || [];
  const learnSkillsList = user.skillsWantToLearn?.length ? user.skillsWantToLearn : user.learnSkills || [];

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
            <WelcomeBanner
              greeting={greeting}
              name={user.name}
              subtitle="Ready to exchange knowledge and earn skill credits today."
              onNewSwapClick={() => navigate('/browse')}
            />

            <KpiStatsGrid
              credits={stats.credits}
              activeSwaps={stats.activeSwaps}
              rating={stats.rating}
              sessionsTaught={stats.sessionsTaught}
            />

            {/* Active User Skills & Customizer Panel */}
            <div className="glass-panel clay-card-3d" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', borderRadius: 'var(--radius-lg, 20px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>⚡</span>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Your Active Skill Loop Profile
                  </h4>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-pill-sm"
                  onClick={() => setShowEditModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
                >
                  <span>✏️</span>
                  <span>Edit / Add Skills</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {/* Skills I Can Teach */}
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md, 12px)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--mint-primary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🎓 What You Can Teach ({teachSkillsList.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {teachSkillsList.length ? (
                      teachSkillsList.map((skill) => (
                        <span key={skill} className="pill-badge pill-mint" style={{ fontSize: '0.78rem' }}>
                          ⚡ {skill}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        No teaching skills set yet. Click Edit Skills above!
                      </span>
                    )}
                  </div>
                </div>

                {/* Skills I Want to Learn */}
                <div style={{ background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.2)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md, 12px)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--violet-primary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🎯 What You Want To Learn ({learnSkillsList.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {learnSkillsList.length ? (
                      learnSkillsList.map((skill) => (
                        <span key={skill} className="pill-badge pill-violet" style={{ fontSize: '0.78rem' }}>
                          🎯 {skill}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        No learning goals set yet. Click Edit Skills above!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Recommended Matches Section with Filter Tabs */}
            <RecommendedMatchesSection 
              matches={matchesData.recommendations}
              recommendations={matchesData.recommendations}
              mutualMatches={matchesData.mutualMatches}
              learnMatches={matchesData.learnMatches}
              teachMatches={matchesData.teachMatches}
              similarMatches={matchesData.similarMatches}
              onEditSkills={() => setShowEditModal(true)}
              loading={loading} 
            />
          </main>
        </div>

        <MobileNav />

        {/* Edit Profile & Skills Modal */}
        {showEditModal && (
          <EditProfileModal
            isOpen={showEditModal}
            user={user}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveProfile}
          />
        )}
      </div>
    </>
  );
}
