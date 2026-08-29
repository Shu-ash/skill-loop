// src/admin/components/AdminMetricsGrid.jsx
import React from 'react';

export default function AdminMetricsGrid({ metrics }) {
  const defaultMetrics = [
    { label: 'Total Users', value: '100', change: '+12% this week', icon: '👥' },
    { label: 'Total Sessions', value: '250', change: '+18% this month', icon: '🎥' },
    { label: 'Total Skills', value: '50', change: 'Active trading', icon: '⚡' }
  ];

  const items = metrics || defaultMetrics;

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
