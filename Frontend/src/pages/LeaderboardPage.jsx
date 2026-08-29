// src/pages/LeaderboardPage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import LeaderboardPodium from '../components/LeaderboardPodium';
import LeaderboardTable from '../components/LeaderboardTable';

const API_BASE_URL = 'http://localhost:5000/api';

export default function LeaderboardPage() {
  const [filterMode, setFilterMode] = useState('month'); // 'month' | 'all'
  const [topTeachers, setTopTeachers] = useState([]);
  const [rankedList, setRankedList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/users/leaderboard`);
        const data = await response.json();

        if (data.success && data.data) {
          setTopTeachers(data.data.podium || []);
          setRankedList(data.data.rankedList || []);
        }
      } catch (err) {
        console.error('Failed to load leaderboard from database:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [filterMode]);

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
                <h2>Top teachers this month</h2>
                <p>Live rankings ranked by sessions taught &amp; member ratings from MongoDB.</p>
              </div>

              {/* Time Filter Toggle */}
              <div className="sliding-tab-nav leaderboard-tab-nav">
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

            {loading ? (
              <div className="glass-panel empty-requests-card">
                Loading live leaderboard...
              </div>
            ) : (
              <>
                {/* Component 1: Top 3 Podium */}
                {topTeachers.length > 0 && <LeaderboardPodium topTeachers={topTeachers} />}

                {/* Component 2: Ranked List Table */}
                {rankedList.length > 0 && <LeaderboardTable members={rankedList} />}
              </>
            )}
          </main>
        </div>

        <MobileNav />
      </div>
    </>
  );
}
