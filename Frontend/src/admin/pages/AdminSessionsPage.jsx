// src/admin/pages/AdminSessionsPage.jsx
import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminSessionsTable from '../components/AdminSessionsTable';
import '../admin.css';

export default function AdminSessionsPage() {
  const [activeTab, setActiveTab] = useState('sessions');

  const sessions = [
    { id: 'sess_101', teacher: 'User 1', learner: 'User 2', topic: 'React Basics', status: 'Completed' },
    { id: 'sess_102', teacher: 'User 2', learner: 'User 3', topic: 'Python Intro', status: 'Disputed' }
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
              <h2>Sessions and Disputes</h2>
              <p>Monitor swap sessions and resolve disputes.</p>
            </div>

            <AdminSessionsTable sessions={sessions} title="Session Audit Logs" />
          </main>
        </div>
      </div>
    </>
  );
}
