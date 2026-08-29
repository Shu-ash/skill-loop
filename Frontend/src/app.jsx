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
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import AdminUsersPage from './admin/pages/AdminUsersPage';
import AdminCategoriesPage from './admin/pages/AdminCategoriesPage';
import AdminSessionsPage from './admin/pages/AdminSessionsPage';
import AdminCreditsPage from './admin/pages/AdminCreditsPage';
import AdminReportsPage from './admin/pages/AdminReportsPage';
import ScrollToTop from './components/ScrollToTop';
import RequireAuth from './components/RequireAuth';
import './index.css';

function App() {
  return (
    <div id="app">
      <ScrollToTop />
      <Routes>
        {/* Unrestricted Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/howitworks" element={<HowItWorksPage />} />

        {/* Protected Private Routes */}
        <Route path="/onboarding" element={<RequireAuth pageTitle="Profile Onboarding"><OnboardingPage /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth pageTitle="your Dashboard"><DashboardPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth pageTitle="your Profile"><ProfilePage /></RequireAuth>} />
        <Route path="/requests" element={<RequireAuth pageTitle="Requests Inbox"><RequestsPage /></RequireAuth>} />
        <Route path="/sessions" element={<RequireAuth pageTitle="Sessions"><SessionsPage /></RequireAuth>} />
        <Route path="/schedule" element={<RequireAuth pageTitle="Sessions"><SessionsPage /></RequireAuth>} />
        <Route path="/credits" element={<RequireAuth pageTitle="Credits Balance"><CreditsPage /></RequireAuth>} />

        {/* Admin Restricted Routes */}
        <Route path="/admin" element={<RequireAuth pageTitle="Admin Control Panel"><AdminDashboardPage /></RequireAuth>} />
        <Route path="/admin/users" element={<RequireAuth pageTitle="Admin Users"><AdminUsersPage /></RequireAuth>} />
        <Route path="/admin/categories" element={<RequireAuth pageTitle="Admin Categories"><AdminCategoriesPage /></RequireAuth>} />
        <Route path="/admin/sessions" element={<RequireAuth pageTitle="Admin Sessions"><AdminSessionsPage /></RequireAuth>} />
        <Route path="/admin/credits" element={<RequireAuth pageTitle="Admin Credits"><AdminCreditsPage /></RequireAuth>} />
        <Route path="/admin/reports" element={<RequireAuth pageTitle="Admin Reports"><AdminReportsPage /></RequireAuth>} />
      </Routes>
    </div>
  );
}

export default App;