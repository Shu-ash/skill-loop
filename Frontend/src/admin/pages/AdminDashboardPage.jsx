// src/admin/pages/AdminDashboardPage.jsx
import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminMetricsGrid from '../components/AdminMetricsGrid';
import AdminUsersTable from '../components/AdminUsersTable';
import '../admin.css';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const users = [
    { id: '1', name: 'User 1', handle: '@user1', skill: 'React JS', status: 'Active' },
    { id: '2', name: 'User 2', handle: '@user2', skill: 'Python', status: 'Active' },
    { id: '3', name: 'User 3', handle: '@user3', skill: 'UI Design', status: 'Active' }
  ];

  return (
    <>
      <div className="liquid-bg">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
      </div>

      <div className="admin-page-container">
        <AdminNavbar />

        <div className="admin-layout">
          <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

          <main className="admin-main-content">
            <div className="page-header">
              <h2>Admin Dashboard</h2>
              <p>Welcome to the SkillLoop admin control panel.</p>
            </div>

            {/* Modular Metrics Component */}
            <AdminMetricsGrid />

            {/* Modular User Table Component */}
            <AdminUsersTable users={users} title="Recent Registered Users" />
          </main>
        </div>
      </div>
    </>
  );
}
