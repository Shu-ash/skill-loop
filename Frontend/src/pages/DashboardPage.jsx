// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import WelcomeBanner from '../components/WelcomeBanner';
import SkillLoopSummaryCard from '../components/SkillLoopSummaryCard';
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
          name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Member',
          username: u.username ? `@${u.username.replace(/^@/, '')}` : '@user',
          teachSkills: u.skillsCanTeach || [],
          learnSkills: u.skillsWantToLearn || [],
          credits: u.credits ?? 3
        };
      } catch (e) {
        console.error(e);
      }
    }
    return { name: 'Member', username: '@user', teachSkills: [], learnSkills: [], credits: 3 };
  });

  const [stats, setStats] = useState({
    credits: 3,
    activeSwaps: 2,
    rating: '5.0',
    sessionsTaught: 6
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

        const userData = await userRes.json();
        const statsData = await statsRes.json();
        const recsData = await recsRes.json();

        if (userRes.ok && userData.data?.user) {
          const backendUser = userData.data.user;
          const fullName = backendUser.name || `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() || 'Member';
          setUser({
            name: fullName,
            username: backendUser.username ? `@${backendUser.username.replace(/^@/, '')}` : '@user',
            teachSkills: backendUser.skillsCanTeach || [],
            learnSkills: backendUser.skillsWantToLearn || [],
            credits: backendUser.credits ?? 3
          });
          localStorage.setItem('skillloop_user', JSON.stringify({ ...backendUser, name: fullName }));
        }

        if (statsRes.ok && statsData.data) {
          setStats(statsData.data);
        }

        if (recsRes.ok && recsData.data?.recommendations?.length) {
          const formatted = recsData.data.recommendations.map((match) => {
            const matchUser = match.user || match;
            const name = matchUser.name || `${matchUser.firstName || ''} ${matchUser.lastName || ''}`.trim() || 'Member';
            return {
              id: matchUser._id || matchUser.id,
              name,
              avatar: name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
              avatarBg: 'var(--violet-primary)',
              title: matchUser.headline || 'SkillLoop Member',
              teachSkills: matchUser.skillsCanTeach || [],
              learnSkills: matchUser.skillsWantToLearn || [],
              rating: `${matchUser.rating ?? 5} ★`
            };
          });
          setRecommendations(formatted);
        } else {
          const usersRes = await fetch(`${API_BASE_URL}/users`, { headers, credentials: 'include' });
          const usersData = await usersRes.json();
          if (usersRes.ok && usersData.data?.users?.length) {
            const formatted = usersData.data.users.slice(0, 3).map((u) => ({
              id: u.id || u._id,
              name: u.name,
              avatar: (u.name || 'SL').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
              avatarBg: 'var(--violet-primary)',
              title: u.headline || 'SkillLoop Member',
              teachSkills: u.skillsCanTeach || [],
              learnSkills: u.skillsWantToLearn || [],
              rating: `${u.rating ?? 5.0} ★`
            }));
            setRecommendations(formatted);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleRequestSwap = (matchUser) => {
    navigate('/browse');
  };

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
            {/* Component 1: Welcome Greeting Banner */}
            <WelcomeBanner
              greeting={greeting}
              name={user.name}
              onNewSwapClick={() => navigate('/browse')}
            />

            {/* Component 2: Your Skill Loop Summary */}
            <SkillLoopSummaryCard
              teachSkills={user.teachSkills}
              learnSkills={user.learnSkills}
            />

            {/* Component 3: Live KPI Metrics Grid */}
            <KpiStatsGrid
              credits={user.credits}
              activeSwaps={stats.activeSwaps}
              rating={stats.rating}
              sessionsTaught={stats.sessionsTaught}
            />

            {/* Component 4: Recommended Matches Section & Match Cards */}
            <RecommendedMatchesSection
              matches={recommendations}
              onRequestSwap={handleRequestSwap}
            />
          </main>
        </div>

        <MobileNav />
      </div>
    </>
  );
}
