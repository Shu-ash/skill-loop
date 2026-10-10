// src/components/RequestsTabNav.jsx
import React from 'react';

// RequestsTabNav: Tab selector bar for Received, Sent, Accepted, and History requests
export default function RequestsTabNav({ activeTab, setActiveTab, onTabChange, counts = {} }) {
  const handleTabClick = (tabId) => {
    if (typeof onTabChange === 'function') {
      onTabChange(tabId);
    } else if (typeof setActiveTab === 'function') {
      setActiveTab(tabId);
    }
  };

  const tabs = [
    { id: 'received', label: `Received (${counts.received || 0})` },
    { id: 'sent', label: `Sent (${counts.sent || 0})` },
    { id: 'accepted', label: `Accepted (${counts.accepted || 0})` },
    { id: 'history', label: `History (${counts.history || 0})` },
  ];

  return (
    <div className="requests-tab-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-pill-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => handleTabClick(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
