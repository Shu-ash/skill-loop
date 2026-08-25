// src/admin/components/AdminSidebar.jsx
import React from 'react';

export default function AdminSidebar({ activeTab = 'dashboard', onSelectTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Users' },
    { id: 'categories', label: 'Categories' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'credits', label: 'Credits' },
    { id: 'reports', label: 'Reports' }
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
              onClick={() => onSelectTab && onSelectTab(item.id)}
            >
              <span className="menu-text">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
