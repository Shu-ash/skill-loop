// src/admin/pages/AdminReportsPage.jsx
import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import '../admin.css';

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('reports');

  return (
    <div className="admin-page-container">
      {/* Top Navbar */}
      <AdminNavbar />

      <div className="admin-layout">
        {/* Simple Fixed Sidebar */}
        <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Main Reports Content */}
        <main className="admin-main-content">
          <div className="page-header">
            <h2>Moderation Queue</h2>
            <p>Review user reports and flagged content.</p>
          </div>

          {/* Reports Card */}
          <div className="admin-table-card">
            <h3 className="table-header-title">Pending Reports</h3>
            <p style={{ color: '#666666', marginTop: '10px' }}>No active reports found in queue.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
