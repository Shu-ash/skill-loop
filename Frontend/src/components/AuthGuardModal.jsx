// src/components/AuthGuardModal.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AuthGuardModal({ pageTitle = "this page" }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="auth-guard-overlay">
      <div className="auth-guard-modal-card glass-panel">
        <div className="auth-guard-badge-icon">🔒</div>
        <h3 className="auth-guard-title">Login Required</h3>
        <p className="auth-guard-desc">
          Please log in to view <strong>{pageTitle}</strong>.
        </p>
        <div className="auth-guard-btn-row">
          <button 
            type="button" 
            className="btn btn-primary btn-full"
            onClick={() => navigate('/login', { state: { from: location.pathname } })}
          >
            Log In →
          </button>
          <button 
            type="button" 
            className="btn btn-secondary btn-full"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
