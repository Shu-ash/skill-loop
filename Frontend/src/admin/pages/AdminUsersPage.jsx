// src/admin/pages/AdminUsersPage.jsx
import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminUsersTable from '../components/AdminUsersTable';
import '../admin.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([
    { id: '1', name: 'User 1', email: 'user1@example.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'User 2', email: 'user2@example.com', role: 'User', status: 'Active' },
    { id: '3', name: 'User 3', email: 'user3@example.com', role: 'User', status: 'Active' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
            'x-admin-token': 'admin2026'
          }
        });
        const data = await response.json();
        if (data.success && data.data?.users?.length) {
          setUsers(data.data.users);
        }
      } catch (err) {
        console.error('Failed to load admin users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'Admin' ? 'user' : 'admin';
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
          'x-admin-token': 'admin2026'
        },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole === 'admin' ? 'Admin' : 'User' } : u));
      }
    } catch (err) {
      console.error('Failed to update role:', err);
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
              <h2>User Management</h2>
              <p>Manage registered members, roles and permissions.</p>
            </div>

            <AdminUsersTable 
              users={users} 
              title="All Registered Members" 
              showEmail={true} 
              onRoleToggle={handleRoleToggle}
            />
          </main>
        </div>
      </div>
    </>
  );
}
