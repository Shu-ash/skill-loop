// src/components/CreditBalanceCards.jsx
import React from 'react';

// CreditBalanceCards: Displays Current Balance, Total Earned (+12), and Total Spent (-9)
export default function CreditBalanceCards({ balance = 10, earned = 0, spent = 0 }) {
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
        <span className="card-label">Earned Credits</span>
        <h2 className="credit-earned-num">+{earned}</h2>
        <p className="card-desc">From teaching sessions</p>
      </div>

      <div className="glass-panel credit-summary-card">
        <span className="card-label">Spent Credits</span>
        <h2 className="credit-spent-num">-{spent}</h2>
        <p className="summary-sub">{spent} sessions learned</p>
      </div>
    </div>
  );
}
