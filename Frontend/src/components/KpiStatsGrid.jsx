// src/components/KpiStatsGrid.jsx

import React from 'react';

export default function KpiStatsGrid({ credits = 10, activeSwaps = 0, rating = '0.0', sessionsTaught = 0 }) {

  //Dashboard stats
  const kpiItems = [
    { id: 'swaps', icon: '⇄', value: activeSwaps, label: 'Active swaps' },
    { id: 'credits', icon: '🪙', value: credits, label: 'Skill credits balance' },
    { id: 'rating', icon: '⭐', value: rating, label: 'Average rating' },
    { id: 'sessions', icon: '🎓', value: sessionsTaught, label: 'Sessions taught' },
  ];

  return (
    <div className="dashboard-kpi-grid">
      {kpiItems.map((item) => (
        <div key={item.id} className="glass-card kpi-card">
          <span className="kpi-icon">{item.icon}</span>
          <div className="kpi-info">
            <h4>{item.value}</h4>
            <p>{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
