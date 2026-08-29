// src/admin/pages/AdminReportsPage.jsx
import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminReportsTable from '../components/AdminReportsTable';
import '../admin.css';

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('reports');

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

            <AdminReportsTable reports={[]} title="Pending Moderation Queue" />
          </main>
        </div>
      </div>
    </>
  );
}
