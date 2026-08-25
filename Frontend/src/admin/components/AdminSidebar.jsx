// src/admin/components/AdminSidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSidebar({ activeTab = 'dashboard', onSelectTab }) {
  const navigate = useNavigate();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path : '/admin' },
    { id: 'users', label: 'Users', path : '/admin/users' },
    { id: 'categories', label: 'Categories', path : '/admin/categories' },
    { id: 'sessions', label: 'Sessions', path : '/admin/sessions' },
    { id: 'credits', label: 'Credits', path : '/admin/credits' },
    { id: 'reports', label: 'Reports', path : '/admin/reports' }
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header-row">
        <span className="sidebar-title">ADMIN MENU</span>
      </div>

      <ul className="admin-menu">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button 
              type="button" 
              className={`menu-item-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="menu-text">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
