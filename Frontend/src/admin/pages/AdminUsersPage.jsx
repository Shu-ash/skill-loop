// src/admin/pages/AdminUsersPage.jsx
import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminUsersTable from '../components/AdminUsersTable';
import '../admin.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('accessToken');
      let loadedUsers = [];

      try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
            'x-admin-token': 'admin2026'
          }
        });
        const data = await response.json();
        if (data.success && data.data?.users?.length) {
          loadedUsers = data.data.users;
        }
      } catch (err) {
        console.error('Failed to load admin users from backend:', err);
      }

      // Check persistent registered users store and merge
      const persistentUsersStr = localStorage.getItem('skillloop_registered_users');
      if (persistentUsersStr) {
        try {
          const persistentUsers = JSON.parse(persistentUsersStr);
          if (Array.isArray(persistentUsers)) {
            persistentUsers.forEach(pu => {
              const exists = loadedUsers.some(u => u.email?.toLowerCase() === pu.email?.toLowerCase());
              if (!exists) {
                loadedUsers.unshift({
                  id: pu.id || `usr_${Date.now()}`,
                  displayId: `#USR-${(pu.id || '').toString().slice(-6).toUpperCase()}`,
                  name: pu.name || 'Registered Member',
                  email: pu.email,
                  handle: pu.username || `@${pu.email.split('@')[0]}`,
                  skill: pu.teachSkills?.[0] || 'Member Skill',
                  role: 'User',
                  status: 'Active',
                  credits: pu.credits ?? 3
                });
              }
            });
          }
        } catch (e) {
          console.error('Error parsing persistent users store:', e);
        }
      }

      // Check single active local user if exists
      const localUserStr = localStorage.getItem('skillloop_user');
      if (localUserStr) {
        try {
          const localUser = JSON.parse(localUserStr);
          if (localUser && localUser.email && !localUser.guest) {
            const exists = loadedUsers.some(u => u.email?.toLowerCase() === localUser.email?.toLowerCase());
            if (!exists) {
              loadedUsers.unshift({
                id: localUser.id || 'usr_active',
                displayId: `#USR-${(localUser.id || '').toString().slice(-6).toUpperCase()}`,
                name: localUser.name || 'Active Member',
                email: localUser.email,
                handle: localUser.username || `@${localUser.email.split('@')[0]}`,
                skill: localUser.teachSkills?.[0] || 'Member Skill',
                role: 'User',
                status: 'Active',
                credits: localUser.credits ?? 3
              });
            }
          }
        } catch (e) {
          console.error('Error parsing local user:', e);
        }
      }

      // Default fallback sample data if empty
      if (loadedUsers.length === 0) {
        loadedUsers = [
          { id: '1', displayId: '#USR-000001', name: 'Super Admin', email: 'admin@skillloop.com', handle: '@admin', skill: 'Platform Mgmt', role: 'Super Admin', status: 'Active', credits: 100 },
          { id: '2', displayId: '#USR-000002', name: 'Aarav Sharma', email: 'aarav@gmail.com', handle: '@aarav_dev', skill: 'React & Node.js', role: 'User', status: 'Active', credits: 12 },
          { id: '3', displayId: '#USR-000003', name: 'Priya Verma', email: 'priya@gmail.com', handle: '@priya_design', skill: 'Figma UI/UX', role: 'User', status: 'Active', credits: 8 }
        ];
      }

      setUsers(loadedUsers);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'Admin' ? 'user' : 'admin';
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
          'x-admin-token': 'admin2026'
        },
        body: JSON.stringify({ role: newRole })
      });
    } catch (err) {
      console.error('Failed to update role:', err);
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole === 'admin' ? 'Admin' : 'User' } : u));
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'banned' : 'active';
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
          'x-admin-token': 'admin2026'
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus === 'banned' ? 'Banned' : 'Active' } : u));
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
              onStatusToggle={handleStatusToggle}
            />
          </main>
        </div>
      </div>
    </>
  );
}
