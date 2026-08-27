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

const RECOMMENDED_MATCHES = [
  {
    id: 'm1',
    name: 'Harsh Vishwakarma',
    avatar: 'HV',
    avatarBg: 'var(--violet-primary)',
    title: 'UI & Photoshop Expert',
    teachSkills: ['Photoshop', 'Figma'],
    learnSkills: ['HTML', 'CSS'],
    rating: '5.0 ★'
  },
  {
    id: 'm2',
    name: 'Sujit Bauna',
    avatar: 'SB',
    avatarBg: 'var(--gold-primary)',
    title: 'AI Specialist & Backend Developer',
    teachSkills: ['React', 'CSS'],
    learnSkills: ['AI', 'Video Editing'],
    rating: '4.9 ★'
  },
  {
    id: 'm3',
    name: 'Debosmita Laha',
    avatar: 'DL',
    avatarBg: 'var(--mint-primary)',
    title: 'Python & Data Science',
    teachSkills: ['Python', 'Pandas'],
    learnSkills: ['JavaScript', 'HTML'],
    rating: '4.8 ★'
  }
];

export default function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: '',
    username: '',
    teachSkills: [],
    learnSkills: [],
    credits: 0
  });

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

    fetchUser();
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
              matches={RECOMMENDED_MATCHES}
              onRequestSwap={handleRequestSwap}
            />
          </main>
        </div>

        <MobileNav />
      </div>
    </>
  );
}
