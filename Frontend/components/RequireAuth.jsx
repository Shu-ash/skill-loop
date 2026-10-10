// src/components/RequireAuth.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthGuardModal from './AuthGuardModal';
import { getAuthStatus } from '../utils/auth';

export default function RequireAuth({ children, pageTitle = "this page", roleRequired = "user" }) {
  const { isAuthenticated, userType } = getAuthStatus();

  if (!isAuthenticated || userType === 'guest') {
    return <AuthGuardModal pageTitle={pageTitle} />;
  }

  if (roleRequired === 'admin' && userType !== 'admin') {
    return <AuthGuardModal pageTitle="Admin Control Panel" />;
  }

  if (roleRequired === 'user' && userType === 'admin') {
    return <AdminUserGuardModal pageTitle={pageTitle} />;
  }

  return children;
}

function AdminUserGuardModal({ pageTitle }) {
  const navigate = useNavigate();

  return (
    <div className="auth-guard-overlay">
      <div className="auth-guard-modal-card glass-panel">
        <div className="auth-guard-badge-icon">🛡️</div>
        <h3 className="auth-guard-title">Admin Account Active</h3>
        <p className="auth-guard-desc">
          You are currently logged in as <strong>Admin</strong>. Viewing <strong>{pageTitle}</strong> requires a regular member account.
        </p>
        <div className="auth-guard-btn-row">
          <button 
            type="button" 
            className="btn btn-primary btn-full"
            onClick={() => navigate('/admin')}
          >
            Go to Admin Control Panel →
          </button>
          <button 
            type="button" 
            className="btn btn-secondary btn-full"
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
          >
            Log Out Admin & Test Guest/User
          </button>
        </div>
      </div>
    </div>
  );
}
