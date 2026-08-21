// src/components/CreditBalanceCards.jsx
import React from 'react';

// CreditBalanceCards: Displays Current Balance, Total Earned (+12), and Total Spent (-9)
export default function CreditBalanceCards({ balance = 3, earned = 12, spent = 9 }) {
  return (
    <div className="credits-summary-grid">
      {/* CURRENT BALANCE */}
      <div className="glass-panel credit-summary-card current-balance-card">
        <span className="summary-label">CURRENT BALANCE</span>
        <h2>{balance}</h2>
        <p className="summary-sub">Skill Credits available</p>
      </div>

      {/* TOTAL EARNED */}
      <div className="glass-panel credit-summary-card total-earned-card">
        <span className="summary-label">TOTAL EARNED</span>
        <h2 style={{ color: 'var(--mint-primary)' }}>+{earned}</h2>
        <p className="summary-sub">{earned} sessions taught</p>
      </div>

      {/* TOTAL SPENT */}
      <div className="glass-panel credit-summary-card total-spent-card">
        <span className="summary-label">TOTAL SPENT</span>
        <h2 style={{ color: 'var(--coral-primary)' }}>-{spent}</h2>
        <p className="summary-sub">{spent} sessions learned</p>
      </div>
    </div>
  );
}
