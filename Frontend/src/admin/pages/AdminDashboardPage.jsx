// src/admin/pages/AdminDashboardPage.jsx
import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import '../admin.css';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Simple static user list with 3 simple users
  const users = [
    { id: '1', name: 'User 1', handle: '@user1', skill: 'React JS', status: 'Active' },
    { id: '2', name: 'User 2', handle: '@user2', skill: 'Python', status: 'Active' },
    { id: '3', name: 'User 3', handle: '@user3', skill: 'UI Design', status: 'Active' }
  ];

  return (
    <div className="admin-page-container">
      {/* Top Navbar */}
      <AdminNavbar />

      <div className="admin-layout">
        {/* Simple Fixed Sidebar */}
        <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Main Dashboard Content */}
        <main className="admin-main-content">
          <div className="page-header">
            <h2>Admin Dashboard</h2>
            <p>Welcome to the SkillLoop admin control panel.</p>
          </div>

          {/* Simple Metrics Grid */}
          <div className="admin-metrics-grid">
            <div className="metric-card">
              <div className="metric-info">
                <span className="metric-label">Total Users</span>
                <span className="metric-value">100</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-info">
                <span className="metric-label">Total Sessions</span>
                <span className="metric-value">250</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-info">
                <span className="metric-label">Total Skills</span>
                <span className="metric-value">50</span>
              </div>
            </div>
          </div>

          {/* Simple User List Table */}
          <div className="admin-table-card">
            <h3 className="table-header-title">User List</h3>
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Handle</th>
                  <th>Skill</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.handle}</td>
                    <td>{u.skill}</td>
                    <td>
                      <span className="pill pill-active">{u.status}</span>
                    </td>
                    <td>
                      <button type="button" className="action-btn">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
