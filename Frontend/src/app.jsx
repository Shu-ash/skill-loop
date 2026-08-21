import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BrowsePage from './pages/BrowsePage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import RequestsPage from './pages/RequestsPage';
import SessionsPage from './pages/SessionsPage';
import CreditsPage from './pages/CreditsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import HowItWorksPage from './pages/HowItWorksPage';
import './index.css';

function App() {
  return (
    <div id="app">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/schedule" element={<SessionsPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/howitworks" element={<HowItWorksPage />} />
      </Routes>
    </div>
  );
}

export default App;