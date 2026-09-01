// src/admin/pages/AdminDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminMetricsGrid from '../components/AdminMetricsGrid';
import AdminUsersTable from '../components/AdminUsersTable';
import '../admin.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const [metricsRes, usersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/metrics`, {
            headers: {
              'Authorization': `Bearer ${token || ''}`,
              'x-admin-token': 'admin2026'
            }
          }),
          fetch(`${API_BASE_URL}/admin/users`, {
            headers: {
              'Authorization': `Bearer ${token || ''}`,
              'x-admin-token': 'admin2026'
            }
          })
        ]);

        const metricsData = await metricsRes.json();
        const usersData = await usersRes.json();

        if (metricsData.success && metricsData.data) {
          const d = metricsData.data;
          setMetrics([
            { label: 'Total Users', value: String(d.totalUsers ?? 0), change: `${d.totalUsers ?? 0} registered members`, icon: '👥' },
            { label: 'Total Sessions', value: String(d.totalSessions ?? 0), change: `${d.activeSessions ?? 0} active / ${d.completedSessions ?? 0} completed`, icon: '🎥' },
            { label: 'Total Skills', value: String(d.totalSkills ?? 0), change: `${d.totalCategories ?? 0} active categories`, icon: '⚡' }
          ]);
        }

        if (usersData.success && usersData.data?.users?.length) {
          setUsers(usersData.data.users.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load live admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

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
              <p>Welcome to the SkillLoop admin control panel. Overview of live platform metrics.</p>
            </div>

            {/* Modular Metrics Component */}
            <AdminMetricsGrid metrics={metrics} />

            {/* Modular User Table Component - Read-only Overview without Action Column */}
            <AdminUsersTable 
              users={users} 
              title="Recent Registered Members" 
              showActions={false} 
            />
          </main>
        </div>
      </div>
    </>
  );
}
