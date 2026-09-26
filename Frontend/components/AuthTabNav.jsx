//src/components/AuthTabNav.jsx

import React from 'react';

export default function AuthTabNav({ authMode, setAuthMode }) {
  return (
    <div className="sliding-tab-nav">
      <div
        className={`sliding-glider ${authMode === 'signup' ? 'slide-right' : 'slide-left'}`}
      ></div>
      <button
        type="button"
        className={`sliding-tab-btn ${authMode === 'login' ? 'active' : ''}`}
        onClick={() => setAuthMode('login')}
      >
        Log In
      </button>
      <button
        type="button"
        className={`sliding-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
        onClick={() => setAuthMode('signup')}
      >
        Create Account
      </button>
    </div>
  );
}