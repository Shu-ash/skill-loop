// src/components/TransactionLedgerTable.jsx
import React, { useState, useMemo } from 'react';

// TransactionLedgerTable: Auditable transaction ledger showing earned and spent credit history with live filter
export default function TransactionLedgerTable({ transactions = [] }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'earned' | 'spent'

  const earnedCount = useMemo(() => {
    return transactions.filter(t => t.type === 'earned' || Number(t.amount) > 0).length;
  }, [transactions]);

  const spentCount = useMemo(() => {
    return transactions.filter(t => t.type === 'spent' || Number(t.amount) < 0).length;
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (filter === 'earned') {
      return transactions.filter((tx) => tx.type === 'earned' || Number(tx.amount) > 0);
    }
    if (filter === 'spent') {
      return transactions.filter((tx) => tx.type === 'spent' || Number(tx.amount) < 0);
    }
    return transactions;
  }, [transactions, filter]);

  return (
    <div className="glass-panel transaction-ledger-card">
      <div className="ledger-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <h3 style={{ margin: 0 }}>Transaction ledger</h3>
          <span className="pill-badge pill-white" style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}>
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* Interactive Filter Dropdown & Segmented Pills */}
        <div className="ledger-filter-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <select 
            className="ledger-filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '0.42rem 0.85rem',
              borderRadius: '12px',
              border: '1.5px solid rgba(226, 232, 240, 0.9)',
              background: 'rgba(255, 255, 255, 0.85)',
              fontFamily: 'inherit',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--slate-700, #334155)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">Filter: All ({transactions.length})</option>
            <option value="earned">Earned (+) ({earnedCount})</option>
            <option value="spent">Spent (-) ({spentCount})</option>
          </select>
        </div>
      </div>

      <div className="ledger-list">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => {
            const isEarned = tx.type === 'earned' || Number(tx.amount) > 0;
            return (
              <div key={tx.id} className="ledger-item">
                <div className={`ledger-icon-badge ${isEarned ? 'earned' : 'spent'}`}>
                  {isEarned ? '↑' : '↓'}
                </div>

                <div className="ledger-info">
                  <h4>{tx.title}</h4>
                  <p>{tx.date} • Session #{tx.sessionId || (tx.id || '').toString().slice(-4)}</p>
                </div>

                <div className={`ledger-amount ${isEarned ? 'earned' : 'spent'}`}>
                  {isEarned ? `+${Math.abs(Number(tx.amount) || 1)}` : `-${Math.abs(Number(tx.amount) || 1)}`}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
            No {filter === 'earned' ? 'earned' : filter === 'spent' ? 'spent' : ''} credit transactions found.
          </div>
        )}
      </div>
    </div>
  );
}
