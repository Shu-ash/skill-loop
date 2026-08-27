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


export default function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: '',
    username: '',
    teachSkills: [],
    learnSkills: [],
    credits: 0
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

    const fetchUser = async () => {
      const accessToken =
        localStorage.getItem('accessToken');

      if (!accessToken) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(
          'http://localhost:5000/api/users/me',
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
            data.message || 'Failed to load user'
          );
        }

        const backendUser =
          data?.data?.user || data?.data;

        setUser({
          name:
            backendUser.name ||
            `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim(),

          username:
            backendUser.username
              ? `@${backendUser.username.replace(/^@/, '')}`
              : '@user',

          teachSkills:
            backendUser.skillsCanTeach || [],

          learnSkills:
            backendUser.skillsWantToLearn || [],

          credits:
            backendUser.credits ?? 0
        });

        localStorage.setItem(
          'skillloop_user',
          JSON.stringify({
            ...backendUser,
            onboardingCompleted: true
          })
        );

      } catch (error) {
        console.error(
          'Failed to fetch dashboard user:',
          error
        );
      }
    };

    const fetchRecommendations = async () => {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        return;
      }

      try {
        const response = await fetch(
          'http://localhost:5000/api/matches/recommendations',
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
            data.message || 'Failed to load recommendations'
          );
        }

        const backendRecommendations =
          data?.data?.recommendations || [];

        const formattedRecommendations =
          backendRecommendations.map((match) => {
            const matchUser = match.user || match;

            const name =
              matchUser.name ||
              `${matchUser.firstName || ''} ${matchUser.lastName || ''}`.trim() ||
              'Skill Loop User';

            return {
              id: matchUser._id || matchUser.id,

              name,

              avatar: name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase(),

              avatarBg: 'var(--violet-primary)',

              title:
                matchUser.headline ||
                'Skill Loop Member',

              teachSkills:
                matchUser.skillsCanTeach || [],

              learnSkills:
                matchUser.skillsWantToLearn || [],

              rating:
                `${matchUser.rating ?? 0} ★`
            };
          });

        setRecommendations(formattedRecommendations);

      } catch (error) {
        console.error(
          'Failed to fetch recommendations:',
          error
        );

        setRecommendations([]);
      }
    };


    fetchUser();
    fetchRecommendations();
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
          <Sidebar
            user={{
              name: user.name,
              credits: user.credits,
              avatar: user.name.slice(0, 2).toUpperCase()
            }}
          />

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

            {/* Component 3: KPI Metrics Grid */}
            <KpiStatsGrid
              credits={user.credits}
              activeSwaps={4}
              rating="4.9"
              sessionsTaught={12}
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
