// src/admin/pages/AdminReportsPage.jsx
import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminReportsTable from '../components/AdminReportsTable';
import '../admin.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const response = await fetch(`${API_BASE_URL}/admin/reports`, {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
            'x-admin-token': 'admin2026'
          }
        });
        const data = await response.json();
        if (data.success && data.data?.reports) {
          setReports(data.data.reports);
        }
      } catch (err) {
        console.error('Failed to load admin reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
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
              <h2>Moderation Queue</h2>
              <p>Review user reports and flagged content.</p>
            </div>

            <AdminReportsTable reports={reports} title="Pending Moderation Queue" />
          </main>
        </div>
      </div>
    </>
  );
}
