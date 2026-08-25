// src/admin/pages/AdminSessionsPage.jsx
import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import '../admin.css';

export default function AdminSessionsPage() {
  const [activeTab, setActiveTab] = useState('sessions');

  // Simple static session list
  const sessions = [
    { id: 'sess_101', teacher: 'User 1', learner: 'User 2', topic: 'React Basics', status: 'Completed' },
    { id: 'sess_102', teacher: 'User 2', learner: 'User 3', topic: 'Python Intro', status: 'Disputed' }
  ];

  return (
    <div className="admin-page-container">
      {/* Top Navbar */}
      <AdminNavbar />

      <div className="admin-layout">
        {/* Simple Fixed Sidebar */}
        <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Main Sessions Content */}
        <main className="admin-main-content">
          <div className="page-header">
            <h2>Sessions and Disputes</h2>
            <p>Monitor swap sessions and resolve disputes.</p>
          </div>

          {/* Sessions Table */}
          <div className="admin-table-card">
            <h3 className="table-header-title">Session Logs</h3>
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Teacher</th>
                  <th>Learner</th>
                  <th>Topic</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.teacher}</td>
                    <td>{s.learner}</td>
                    <td>{s.topic}</td>
                    <td>
                      <span className={`pill ${s.status === 'Completed' ? 'pill-active' : 'pill-user'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="action-btn">View</button>
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
