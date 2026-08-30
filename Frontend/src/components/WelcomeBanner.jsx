// src/components/WelcomeBanner.jsx
import React from 'react';

export default function WelcomeBanner({ greeting, name, subtitle, onNewSwapClick }) {
  return (
    <div className="dashboard-welcome-banner glass-panel">
      {/* Welcome Text Section and new swap request button */}
      <div className="welcome-text">
        <h2>{greeting}, {name} 👋</h2>
        <p>{subtitle || 'Ready to exchange knowledge and earn skill credits today.'}</p>
      </div>
      <button 
        type="button"
        className="btn btn-primary"
        onClick={onNewSwapClick}
      >
        + New swap request
      </button>
    </div>
  );
}
