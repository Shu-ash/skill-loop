// src/admin/pages/AdminSessionsPage.jsx
import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminSessionsTable from '../components/AdminSessionsTable';
import '../admin.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminSessionsPage() {
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([
    { id: 'sess_101', teacher: 'User 1', learner: 'User 2', topic: 'React Basics', status: 'Completed' },
    { id: 'sess_102', teacher: 'User 2', learner: 'User 3', topic: 'Python Intro', status: 'Disputed' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const response = await fetch(`${API_BASE_URL}/admin/sessions`, {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
            'x-admin-token': 'admin2026'
          }
        });
        const data = await response.json();
        if (data.success && data.data?.sessions?.length) {
          setSessions(data.data.sessions);
        }
      } catch (err) {
        console.error('Failed to load admin sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleResolveDispute = async (sessionId) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sessions/${sessionId}/dispute`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
          'x-admin-token': 'admin2026'
        },
        body: JSON.stringify({ resolution: 'Resolved by Admin', awardTo: 'teacher' })
      });
      if (response.ok) {
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'Completed' } : s));
      }
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
    }
  };

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
              <h2>Sessions &amp; Disputes</h2>
              <p>Monitor live swap sessions, review logs, and resolve member disputes.</p>
            </div>

            <AdminSessionsTable 
              sessions={sessions} 
              title="Session Audit Logs" 
              onResolveDispute={handleResolveDispute}
            />
          </main>
        </div>
      </div>
    </>
  );
}
