// src/admin/pages/AdminUsersPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminUsersTable from '../components/AdminUsersTable';
import AdminSearchFilterBar from '../components/AdminSearchFilterBar';
import AdminActionModal from '../components/AdminActionModal';
import '../admin.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Center Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    icon: '⚠️',
    message: '',
    confirmText: 'Confirm',
    confirmType: 'primary',
    details: null,
    isDetailsOnly: false,
    onConfirm: null,
    loading: false
  });

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
      if (data.success && Array.isArray(data.data?.users)) {
        setUsers(data.data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Failed to load admin users from backend:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const search = searchQuery.trim().toLowerCase();
      const matchesSearch = !search ||
        (u.name && u.name.toLowerCase().includes(search)) ||
        (u.email && u.email.toLowerCase().includes(search)) ||
        (u.handle && u.handle.toLowerCase().includes(search)) ||
        (u.skill && u.skill.toLowerCase().includes(search)) ||
        (u.displayId && u.displayId.toLowerCase().includes(search)) ||
        (u.id && u.id.toString().toLowerCase().includes(search));

      const matchesRole = selectedRole === 'All Roles' ||
        (selectedRole === 'Super Admin' && (u.role?.toLowerCase().includes('super') || u.email === 'admin@skillloop.com')) ||
        (selectedRole === 'Admin' && u.role === 'Admin' && !u.role?.toLowerCase().includes('super')) ||
        (selectedRole === 'User' && (u.role === 'User' || !u.role));

      const matchesStatus = selectedStatus === 'All Status' ||
        (selectedStatus === 'Active' && u.status?.toLowerCase() === 'active') ||
        (selectedStatus === 'Banned' && u.status?.toLowerCase() === 'banned');

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const handleRoleToggleClick = (user) => {
    const isPromoting = user.role !== 'Admin' && user.role !== 'admin';
    const targetRole = isPromoting ? 'admin' : 'user';

    setModalConfig({
      isOpen: true,
      title: isPromoting ? '👑 Promote to Admin' : '👤 Demote to Member',
      icon: isPromoting ? '👑' : '👤',
      message: isPromoting
        ? `Are you sure you want to grant Administrator permissions to "${user.name}"? They will be able to access the admin dashboard, resolve disputes, and manage categories.`
        : `Are you sure you want to demote "${user.name}" back to a standard Member?`,
      confirmText: isPromoting ? 'Make Administrator' : 'Demote to Member',
      confirmType: isPromoting ? 'primary' : 'warning',
      details: {
        'User Name': user.name,
        'Email Address': user.email || 'N/A',
        'User ID': user.displayId || `#USR-${(user.id || user._id).slice(-6).toUpperCase()}`,
        'Current Role': user.role || 'User',
        'Target Role': isPromoting ? 'Admin' : 'User'
      },
      isDetailsOnly: false,
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, loading: true }));
        const token = localStorage.getItem('accessToken');
        const userId = user.id || user._id;
        try {
          await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token || ''}`,
              'x-admin-token': 'admin2026'
            },
            body: JSON.stringify({ role: targetRole })
          });
        } catch (err) {
          console.error('Failed to update role:', err);
        }
        setUsers(prev => prev.map(u => (u.id || u._id) === userId ? { ...u, role: isPromoting ? 'Admin' : 'User' } : u));
        setModalConfig(prev => ({ ...prev, isOpen: false, loading: false }));
      }
    });
  };

  const handleStatusToggleClick = (user) => {
    const isBanning = user.status === 'Active' || user.status === 'active';
    const targetStatus = isBanning ? 'banned' : 'active';
    const userId = user.id || user._id;

    setModalConfig({
      isOpen: true,
      title: isBanning ? '⛔ Ban Member Account' : '✅ Reactivate Member Account',
      icon: isBanning ? '⛔' : '✅',
      message: isBanning
        ? `Are you sure you want to ban "${user.name}"? Banned users will be blocked from logging in, booking sessions, and requesting skill swaps.`
        : `Are you sure you want to restore full platform access for "${user.name}"?`,
      confirmText: isBanning ? 'Yes, Ban Account' : 'Reactivate Account',
      confirmType: isBanning ? 'danger' : 'success',
      details: {
        'Member Name': user.name,
        'Email Address': user.email || 'N/A',
        'User ID': user.displayId || `#USR-${userId.slice(-6).toUpperCase()}`,
        'Current Status': user.status,
        'Action': isBanning ? 'Ban & Revoke Access' : 'Restore Full Access'
      },
      isDetailsOnly: false,
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, loading: true }));
        const token = localStorage.getItem('accessToken');
        try {
          await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token || ''}`,
              'x-admin-token': 'admin2026'
            },
            body: JSON.stringify({ status: targetStatus })
          });
        } catch (err) {
          console.error('Failed to update status:', err);
        }
        setUsers(prev => prev.map(u => (u.id || u._id) === userId ? { ...u, status: isBanning ? 'Banned' : 'Active' } : u));
        setModalConfig(prev => ({ ...prev, isOpen: false, loading: false }));
      }
    });
  };

  const handleViewDetails = (user) => {
    const userId = user.id || user._id;
    setModalConfig({
      isOpen: true,
      title: '👤 Member Profile Details',
      icon: '📋',
      message: `Full profile and account details for ${user.name} from MongoDB.`,
      isDetailsOnly: true,
      details: {
        'Full Name': user.name,
        'Email': user.email || 'N/A',
        'Password Status': '🔒 Encrypted (Bcrypt Protected)',
        'Handle': user.handle || `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
        'System User ID': user.displayId || `#USR-${userId.slice(-6).toUpperCase()}`,
        'Role': user.role || 'User',
        'Account Status': user.status || 'Active',
        'Skill Credits Balance': `${user.credits ?? 10} Credits`
      },
      onConfirm: null
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedRole('All Roles');
    setSelectedStatus('All Status');
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
              <p>Search, filter, and manage registered members, credentials, and roles.</p>
            </div>

            {/* Admin Search & Filter Bar */}
            <AdminSearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search members by name, email, handle, skill, or ID..."
              filters={[
                {
                  label: 'Role',
                  value: selectedRole,
                  onChange: setSelectedRole,
                  options: ['All Roles', 'User', 'Admin', 'Super Admin']
                },
                {
                  label: 'Status',
                  value: selectedStatus,
                  onChange: setSelectedStatus,
                  options: ['All Status', 'Active', 'Banned']
                }
              ]}
              onClearFilters={handleClearFilters}
            />

            <AdminUsersTable 
              users={filteredUsers} 
              title={`All Registered Members (${filteredUsers.length})`} 
              showEmail={true} 
              showActions={true}
              onRoleToggle={handleRoleToggleClick}
              onStatusToggle={handleStatusToggleClick}
              onViewDetails={handleViewDetails}
              loading={loading}
            />
          </main>
        </div>
      </div>

      {/* Center Screen Confirmation & Details Modal */}
      <AdminActionModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        icon={modalConfig.icon}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        confirmType={modalConfig.confirmType}
        details={modalConfig.details}
        isDetailsOnly={modalConfig.isDetailsOnly}
        loading={modalConfig.loading}
      />
    </>
  );
}
