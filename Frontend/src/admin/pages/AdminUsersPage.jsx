// src/admin/pages/AdminUsersPage.jsx
import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import '../admin.css';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('users');

  // Simple static user list
  const users = [
    { id: '1', name: 'User 1', email: 'user1@example.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'User 2', email: 'user2@example.com', role: 'User', status: 'Active' },
    { id: '3', name: 'User 3', email: 'user3@example.com', role: 'User', status: 'Active' }
  ];

  return (
    <div className="admin-page-container">
      {/* Top Navbar */}
      <AdminNavbar />

      <div className="admin-layout">
        {/* Simple Fixed Sidebar */}
        <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Main User Management Content */}
        <main className="admin-main-content">
          <div className="page-header">
            <h2>User Management</h2>
            <p>Manage registered members and roles.</p>
          </div>

          {/* User Table */}
          <div className="admin-table-card">
            <h3 className="table-header-title">All Users</h3>
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`pill ${u.role === 'Admin' ? 'pill-admin' : 'pill-user'}`}>
                        {u.role}
                      </span>
                    </td>
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
