// src/pages/LeaderboardPage.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import LeaderboardPodium from '../components/LeaderboardPodium';
import LeaderboardTable from '../components/LeaderboardTable';

// Top Teachers Leaderboard Mock Data
const TOP_TEACHERS = [
  { rank: 1, name: 'Harsh Vishwakarma', avatar: 'HV', sessions: 24, rating: '5.0 ★' },
  { rank: 2, name: 'Sujit Bauna', avatar: 'SB', sessions: 18, rating: '4.9 ★' },
  { rank: 3, name: 'Debosmita Laha', avatar: 'DL', sessions: 15, rating: '5.0 ★' }
];

const RANKED_LIST = [
  { rank: 4, name: 'Milon Hackathon', avatar: 'MH', avatarBg: 'var(--coral-primary)', skills: 'MongoDB • Express.js', sessions: 12 },
  { rank: 5, name: 'Harsh Vishwakarma', avatar: 'HV', avatarBg: 'var(--deep-violet)', skills: 'React • HTML/CSS', sessions: 12, isCurrentUser: true },
  { rank: 6, name: 'Sample Member 1', avatar: 'S1', avatarBg: 'var(--mint-primary)', skills: 'Conversational English', sessions: 9 },
  { rank: 7, name: 'Sample Member 2', avatar: 'S2', avatarBg: 'var(--violet-primary)', skills: 'Python • Data Science', sessions: 7 }
];

export default function LeaderboardPage() {
  const [filterMode, setFilterMode] = useState('month'); // 'month' | 'all'

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
          <Sidebar user={{ name: 'Harsh', credits: 3, avatar: 'HA' }} />

          <main className="main-content">
            <div className="page-title-row">
              <div>
                <h2>Top teachers this month</h2>
                <p>Ranked by sessions taught &amp; average rating.</p>
              </div>

              {/* Time Filter Toggle */}
              <div className="sliding-tab-nav" style={{ width: '220px', margin: 0 }}>
                <div 
                  className="sliding-glider"
                  style={{ transform: filterMode === 'month' ? 'translateX(0%)' : 'translateX(100%)' }}
                ></div>
                <button
                  type="button"
                  className={`sliding-tab-btn ${filterMode === 'month' ? 'active' : ''}`}
                  onClick={() => setFilterMode('month')}
                >
                  This month
                </button>
                <button
                  type="button"
                  className={`sliding-tab-btn ${filterMode === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterMode('all')}
                >
                  All time
                </button>
              </div>
            </div>

            {/* Component 1: Top 3 Podium */}
            <LeaderboardPodium topTeachers={TOP_TEACHERS} />

            {/* Component 2: Ranked List Table */}
            <LeaderboardTable members={RANKED_LIST} />
          </main>
        </div>

        <MobileNav />
      </div>
    </>
  );
}
