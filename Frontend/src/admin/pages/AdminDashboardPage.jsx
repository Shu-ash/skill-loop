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
  const [users, setUsers] = useState([
    { id: '1', name: 'User 1', handle: '@user1', skill: 'React JS', status: 'Active' },
    { id: '2', name: 'User 2', handle: '@user2', skill: 'Python', status: 'Active' },
    { id: '3', name: 'User 3', handle: '@user3', skill: 'UI Design', status: 'Active' }
  ]);
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
          setMetrics([
            { label: 'Total Users', value: String(metricsData.data.totalUsers || 100), change: '+12% this week', icon: '👥' },
            { label: 'Total Sessions', value: String(metricsData.data.totalSessions || 250), change: '+18% this month', icon: '🎥' },
            { label: 'Total Skills', value: String(metricsData.data.totalSkills || 50), change: 'Active trading', icon: '⚡' }
          ]);
        }

        if (usersData.success && usersData.data?.users?.length) {
          setUsers(usersData.data.users);
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
              <p>Welcome to the SkillLoop admin control panel.</p>
            </div>

            {/* Modular Metrics Component */}
            <AdminMetricsGrid metrics={metrics} />

            {/* Modular User Table Component */}
            <AdminUsersTable users={users} title="Recent Registered Users" />
          </main>
        </div>
      </div>
    </>
  );
}
