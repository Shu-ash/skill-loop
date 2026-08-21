//src/components/AuthTabNav.jsx

import React from 'react';

export default function AuthTabNav({ authMode, setAuthMode }) {
  return (
    <div className="sliding-tab-nav">
      <div
        className="sliding-glider"
        style={{
          transform: authMode === 'login' ? 'translateX(0%)' : 'translateX(100%)'
        }}
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