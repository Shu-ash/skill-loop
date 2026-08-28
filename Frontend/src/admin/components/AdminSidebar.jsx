// src/admin/components/AdminSidebar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSidebar({ activeTab = 'dashboard' }) {
  const navigate = useNavigate();

  // Read initial collapsed state from localStorage so state persists across page transitions
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin' },
    { id: 'users', label: 'Users', icon: '👥', path: '/admin/users' },
    { id: 'categories', label: 'Categories', icon: '🏷️', path: '/admin/categories' },
    { id: 'sessions', label: 'Sessions', icon: '📅', path: '/admin/sessions' },
    { id: 'credits', label: 'Credits', icon: '🪙', path: '/admin/credits' },
    { id: 'reports', label: 'Reports', icon: '🚨', path: '/admin/reports' }
  ];

  // Manual toggle button handler
  const handleToggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('admin_sidebar_collapsed', String(nextState));
  };

  // Click handler for menu items: navigate directly without altering collapse state
  const handleMenuClick = (path) => {
    navigate(path);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem('admin_sidebar_collapsed');
    navigate('/login');
  };

  return (
    <>
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div>
          <div className="sidebar-header-row">
            <span className="sidebar-title">ADMIN MENU</span>
            <button 
              type="button" 
              className="toggle-btn" 
              onClick={handleToggleSidebar}
              title="Toggle Sidebar Width"
            >
              {isCollapsed ? '▶' : '◀'}
            </button>
          </div>

          <ul className="admin-menu">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button 
                  type="button" 
                  className={`menu-item-btn ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => handleMenuClick(item.path)}
                  title={item.label}
                >
                  <span className="icon">{item.icon}</span>
                  <span className="menu-text">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Logout Button */}
        <div className="sidebar-bottom-section">
          <button 
            type="button" 
            className="menu-item-btn logout-btn" 
            onClick={handleLogoutClick}
            title="Logout of Admin"
          >
            <span className="icon">↪️</span>
            <span className="menu-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Sleek Glassmorphic Confirmation Modal for Logout */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div 
            className="glass-panel logout-confirm-box clay-card-3d" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>↪️ Confirm Logout</h3>
              <button 
                type="button" 
                className="close-modal-btn" 
                onClick={() => setShowLogoutModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body modal-body-padded">
              <p className="logout-modal-text">
                Are you sure you want to log out of the Admin Control Panel?
              </p>
              <div className="modal-action-buttons">
                <button 
                  type="button" 
                  className="action-btn" 
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-danger-pill" 
                  onClick={confirmLogout}
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
