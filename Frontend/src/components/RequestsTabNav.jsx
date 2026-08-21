// src/components/RequestsTabNav.jsx
import React from 'react';

// RequestsTabNav: Tab selector bar for Received, Sent, Accepted, and History requests
export default function RequestsTabNav({ activeTab, setActiveTab, counts }) {
  const tabs = [
    { id: 'received', label: `Received (${counts.received})` },
    { id: 'sent', label: `Sent (${counts.sent})` },
    { id: 'accepted', label: `Accepted (${counts.accepted})` },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="requests-tab-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-pill-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
