// src/admin/components/AdminMetricsGrid.jsx
import React from 'react';

export default function AdminMetricsGrid({ metrics }) {
  const defaultMetrics = [
    { label: 'Total Users', value: '0', change: 'Live members', icon: '👥' },
    { label: 'Total Sessions', value: '0', change: 'Live session audit', icon: '🎥' },
    { label: 'Total Skills', value: '0', change: 'Active categories in DB', icon: '⚡' }
  ];

  const items = metrics && metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <div className="admin-metrics-grid">
      {items.map((m, index) => (
        <div key={index} className="metric-card">
          <div className="metric-info">
            <span className="metric-label">{m.label}</span>
            <span className="metric-value">{m.value}</span>
            {m.change && <span className="metric-subtext">{m.change}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
