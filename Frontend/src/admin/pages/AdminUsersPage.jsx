// src/admin/pages/AdminUsersPage.jsx
import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminUsersTable from '../components/AdminUsersTable';
import '../admin.css';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('users');

  const users = [
    { id: '1', name: 'User 1', email: 'user1@example.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'User 2', email: 'user2@example.com', role: 'User', status: 'Active' },
    { id: '3', name: 'User 3', email: 'user3@example.com', role: 'User', status: 'Active' }
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
              <h2>User Management</h2>
              <p>Manage registered members and roles.</p>
            </div>

            <AdminUsersTable users={users} title="All Registered Members" showEmail={true} />
          </main>
        </div>
      </div>
    </>
  );
}
