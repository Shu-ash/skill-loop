// src/components/TransactionLedgerTable.jsx
import React from 'react';

// TransactionLedgerTable: Auditable transaction ledger showing earned and spent credit history
export default function TransactionLedgerTable({ transactions = [] }) {
  return (
    <div className="glass-panel transaction-ledger-card">
      <div className="ledger-header">
        <h3>Transaction ledger</h3>
        <span className="pill-badge pill-white">Filter: All ▼</span>
      </div>

      <div className="ledger-list">
        {transactions.map((tx) => (
          <div key={tx.id} className="ledger-item">
            <div className={`ledger-icon-badge ${tx.type === 'earned' ? 'earned' : 'spent'}`}>
              {tx.type === 'earned' ? '↑' : '↓'}
            </div>

            <div className="ledger-info">
              <h4>{tx.title}</h4>
              <p>{tx.date} • Session #{tx.sessionId}</p>
            </div>

            <div className={`ledger-amount ${tx.type === 'earned' ? 'earned' : 'spent'}`}>
              {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
