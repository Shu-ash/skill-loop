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

        {/* Protected Private User Routes */}
        <Route path="/onboarding" element={<RequireAuth pageTitle="Profile Onboarding" roleRequired="user"><OnboardingPage /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth pageTitle="your Dashboard" roleRequired="user"><DashboardPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth pageTitle="your Profile" roleRequired="user"><ProfilePage /></RequireAuth>} />
        <Route path="/requests" element={<RequireAuth pageTitle="Requests Inbox" roleRequired="user"><RequestsPage /></RequireAuth>} />
        <Route path="/sessions" element={<RequireAuth pageTitle="Sessions" roleRequired="user"><SessionsPage /></RequireAuth>} />
        <Route path="/schedule" element={<RequireAuth pageTitle="Sessions" roleRequired="user"><SessionsPage /></RequireAuth>} />
        <Route path="/credits" element={<RequireAuth pageTitle="Credits Balance" roleRequired="user"><CreditsPage /></RequireAuth>} />

        {/* Admin Restricted Routes */}
        <Route path="/admin" element={<RequireAuth pageTitle="Admin Control Panel" roleRequired="admin"><AdminDashboardPage /></RequireAuth>} />
        <Route path="/admin/users" element={<RequireAuth pageTitle="Admin Users" roleRequired="admin"><AdminUsersPage /></RequireAuth>} />
        <Route path="/admin/categories" element={<RequireAuth pageTitle="Admin Categories" roleRequired="admin"><AdminCategoriesPage /></RequireAuth>} />
        <Route path="/admin/sessions" element={<RequireAuth pageTitle="Admin Sessions" roleRequired="admin"><AdminSessionsPage /></RequireAuth>} />
        <Route path="/admin/credits" element={<RequireAuth pageTitle="Admin Credits" roleRequired="admin"><AdminCreditsPage /></RequireAuth>} />
        <Route path="/admin/reports" element={<RequireAuth pageTitle="Admin Reports" roleRequired="admin"><AdminReportsPage /></RequireAuth>} />
      </Routes>
    </div>
  );
}

export default App;