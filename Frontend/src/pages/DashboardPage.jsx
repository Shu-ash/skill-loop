// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import WelcomeBanner from '../components/WelcomeBanner';
import KpiStatsGrid from '../components/KpiStatsGrid';
import RecommendedMatchesSection from '../components/RecommendedMatchesSection';

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
          credits: u.credits ?? 10
        };
      } catch (e) {
        console.error(e);
      }
    }
    return { id: null, name: 'Member', username: '@user', teachSkills: [], learnSkills: [], credits: 10 };
  });

  const [stats, setStats] = useState({
    credits: 10,
    activeSwaps: 0,
    rating: '0.0',
    sessionsTaught: 0,
    pendingRequests: 0,
    upcomingSessions: 0
  });

  const [recommendations, setRecommendations] = useState([]);
  const [greeting, setGreeting] = useState('Good evening');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }

    const fetchDashboardData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const headers = { Authorization: `Bearer ${accessToken}` };

      try {
        const [userRes, statsRes, recsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/me`, { headers, credentials: 'include' }),
          fetch(`${API_BASE_URL}/users/dashboard-stats`, { headers, credentials: 'include' }),
          fetch(`${API_BASE_URL}/matches/recommendations`, { headers, credentials: 'include' })
        ]);

        if (userRes.status === 401 || statsRes.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('skillloop_user');
          navigate('/login');
          return;
        }

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
          setUser({
            id: loggedInUserId,
            name: fullName,
            username: backendUser.username ? `@${backendUser.username.replace(/^@/, '')}` : '@user',
            teachSkills: Array.isArray(backendUser.skillsCanTeach) ? backendUser.skillsCanTeach : [],
            learnSkills: Array.isArray(backendUser.skillsWantToLearn) ? backendUser.skillsWantToLearn : [],
            credits: backendUser.credits ?? 10
          });
          localStorage.setItem('skillloop_user', JSON.stringify({ ...backendUser, name: fullName }));
        }

        if (statsRes.ok && statsData.data) {
          setStats(statsData.data);
        }

        if (recsRes.ok && recsData.data?.recommendations?.length) {
          const formatted = recsData.data.recommendations
            .filter((match) => {
              const matchUser = match.user || match;
              const matchId = matchUser._id || matchUser.id;
              const matchEmail = (matchUser.email || '').toLowerCase();
              if (loggedInUserId && String(matchId) === String(loggedInUserId)) return false;
              if (loggedInEmail && matchEmail === loggedInEmail) return false;
              return true;
            })
            .map((match) => {
              const matchUser = match.user || match;
              const name = matchUser.name || `${matchUser.firstName || ''} ${matchUser.lastName || ''}`.trim() || 'Member';
              return {
                id: matchUser._id || matchUser.id,
                name,
                avatar: name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'SL',
                avatarBg: 'var(--violet-primary)',
                title: matchUser.headline || 'SkillLoop Member',
                teachSkills: matchUser.skillsCanTeach || [],
                learnSkills: matchUser.skillsWantToLearn || [],
                rating: `${(matchUser.rating || 0).toFixed(1)} ★`
              };
            });
          setRecommendations(formatted);
        } else {
          // Fallback other members from users API (always strictly exclude self)
          const usersRes = await fetch(`${API_BASE_URL}/users`, { headers, credentials: 'include' });
          const usersData = await usersRes.json();
          if (usersRes.ok && usersData.data?.users?.length) {
            const formatted = usersData.data.users
              .filter((u) => {
                const uId = u.id || u._id;
                const uEmail = (u.email || '').toLowerCase();
                if (loggedInUserId && String(uId) === String(loggedInUserId)) return false;
                if (loggedInEmail && uEmail === loggedInEmail) return false;
                return true;
              })
              .slice(0, 3)
              .map((u) => ({
                id: u.id || u._id,
                name: u.name,
                avatar: (u.name || 'SL').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'SL',
                avatarBg: 'var(--violet-primary)',
                title: u.headline || 'SkillLoop Member',
                teachSkills: u.skillsCanTeach || [],
                learnSkills: u.skillsWantToLearn || [],
                rating: `${(u.rating || 0).toFixed(1)} ★`
              }));
            setRecommendations(formatted);
          } else {
            setRecommendations([]);
          }
        }

      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, [navigate]);

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

            <RecommendedMatchesSection recommendations={recommendations} />
          </main>
        </div>

        <MobileNav />
      </div>
    </>
  );
}
