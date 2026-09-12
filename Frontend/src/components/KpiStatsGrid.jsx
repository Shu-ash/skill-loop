// src/components/KpiStatsGrid.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function KpiStatsGrid({ credits = 0, activeSwaps = 0, rating = '5.0', sessionsTaught = 0 }) {
  const navigate = useNavigate();

  // Dashboard stats
  const kpiItems = [
    { id: 'swaps', icon: '⇄', value: activeSwaps, label: 'Active swaps', path: '/requests' },
    { id: 'credits', icon: '🪙', value: credits, label: 'Skill credits balance', path: '/credits' },
    { id: 'rating', icon: '⭐', value: rating, label: 'Average rating', path: '/reviews' },
    { id: 'sessions', icon: '🎓', value: sessionsTaught, label: 'Sessions taught', path: '/sessions' },
  ];

  return (
    <div className="dashboard-kpi-grid">
      {kpiItems.map((item) => (
        <div 
          key={item.id} 
          className="glass-card kpi-card"
          onClick={() => navigate(item.path)}
          style={{ cursor: 'pointer' }}
          title={`Click to view ${item.label}`}
        >
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
