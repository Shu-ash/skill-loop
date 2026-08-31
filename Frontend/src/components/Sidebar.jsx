// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Sidebar({ user: propUser }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    if (propUser && propUser.name && propUser.name !== "User Account" && propUser.name !== "Member") {
      return propUser;
    }
    const stored = localStorage.getItem('skillloop_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'SkillLoop Member';
        const initials = name.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'SL';
        return {
          name,
          credits: u.credits ?? 10,
          avatar: initials
        };
      } catch (e) {
        console.error(e);
      }
    }
    return { name: "SkillLoop Member", credits: 10, avatar: "SL" };
  });

  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Fetch pending received requests count dynamically from MongoDB database
  useEffect(() => {
    const fetchPendingCount = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/requests/received`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.data?.requests)) {
          const pendingCount = data.data.requests.filter(r => r.status === 'pending').length;
          setPendingRequestsCount(pendingCount);
        }
      } catch (e) {
        // quiet fallback
      }
    };

    fetchPendingCount();
  }, [location.pathname]);

  useEffect(() => {
    if (propUser && propUser.name && propUser.name !== "User Account" && propUser.name !== "Member") {
      setCurrentUser(propUser);
      return;
    }

    const loadActiveUser = async () => {
      const stored = localStorage.getItem('skillloop_user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'SkillLoop Member';
          const initials = name.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'SL';
          setCurrentUser({
            name,
            credits: u.credits ?? 10,
            avatar: initials
          });
        } catch (e) {
          console.error(e);
        }
      }

      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.data?.user) {
            const u = data.data.user;
            const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'SkillLoop Member';
            const initials = name.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'SL';
            const updated = {
              name,
              credits: u.credits ?? 10,
              avatar: initials
            };
            setCurrentUser(updated);
            localStorage.setItem('skillloop_user', JSON.stringify({ ...u, name }));
          }
        } catch (e) {
          // offline fallback
        }
      }
    };

    loadActiveUser();
  }, [propUser]);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('user_sidebar_collapsed') === 'true';
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { label: 'Browse skills', icon: '🔍', path: '/browse' },
    { label: 'My requests', icon: '📥', path: '/requests', badge: pendingRequestsCount > 0 ? pendingRequestsCount : null },
    { label: 'Sessions', icon: '📅', path: '/sessions' },
    { label: 'Credits', icon: '🪙', path: '/credits' },
    { label: 'Leaderboard', icon: '🏆', path: '/leaderboard' },
    { label: 'My profile', icon: '👤', path: '/profile' },
  ];

  const handleToggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('user_sidebar_collapsed', String(nextState));
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login');
  };

  return (
    <>
      <aside className={`user-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div>
          <div className="sidebar-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span className="sidebar-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-400)', letterSpacing: '0.08em' }}>
              NAVIGATION
            </span>
            <button 
              type="button" 
              className="toggle-btn"
              onClick={handleToggleSidebar}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--slate-500)', padding: '4px' }}
            >
              {isCollapsed ? '▶' : '◀'}
            </button>
          </div>

          <ul className="user-sidebar-menu">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`user-menu-item-btn ${isActive ? 'active' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="sidebar-icon-wrapper">
                      <span className="icon">{item.icon}</span>
                      {isCollapsed && item.badge ? (
                        <span className="collapsed-badge-dot">{item.badge}</span>
                      ) : null}
                    </div>
                    <span className="menu-text">{item.label}</span>
                    {!isCollapsed && item.badge ? (
                      <span className="subnav-badge-count" style={{ marginLeft: 'auto' }}>
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* User Sidebar Bottom Profile Section */}
        <div className="user-sidebar-bottom">
          <Link to="/profile" className="user-chip-link" style={{ marginBottom: '0.65rem' }}>
            <div className="subnav-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.82rem', background: 'var(--violet-primary, #6c5ce7)', flexShrink: 0 }}>
              {currentUser.avatar}
            </div>
            <div className="subnav-user-text" style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--slate-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                🪙 {currentUser.credits} credits
              </div>
            </div>
          </Link>

          <button 
            type="button" 
            className="user-menu-item-btn" 
            onClick={() => setShowLogoutModal(true)}
            style={{ color: 'var(--coral-primary, #ff7675)' }}
            title="Log out of SkillLoop"
          >
            <div className="sidebar-icon-wrapper">
              <span className="icon">↪</span>
            </div>
            <span className="menu-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal Portal */}
      {showLogoutModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="modal-overlay" 
          onClick={() => setShowLogoutModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
        >
          <div 
            className="glass-panel clay-card-3d" 
            onClick={(e) => e.stopPropagation()} 
            style={{
              maxWidth: '420px',
              width: '100%',
              borderRadius: '24px',
              padding: '2.2rem 2rem',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.6rem' }}>🚪</span>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.35rem', fontFamily: 'var(--font-display)' }}>
              Confirm Logout
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--slate-500)', fontSize: '0.92rem' }}>
              Are you sure you want to sign out of your SkillLoop account?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowLogoutModal(false)}
                style={{ padding: '0.7rem 1.4rem', borderRadius: '14px' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-danger" 
                onClick={handleLogout}
                style={{ padding: '0.7rem 1.6rem', borderRadius: '14px', background: 'var(--coral-primary, #ff7675)', borderColor: 'var(--coral-primary, #ff7675)', fontWeight: 700 }}
              >
                Sign Out ↪
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}