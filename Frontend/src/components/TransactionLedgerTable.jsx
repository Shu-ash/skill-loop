import React, { useState, useMemo } from 'react';
import SkillLoopLoader from './SkillLoopLoader';

// TransactionLedgerTable: Auditable transaction ledger showing earned and spent credit history with live filter
export default function TransactionLedgerTable({ transactions = [], loading = false }) {
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
      <div className="ledger-header">
        <div className="ledger-title-group">
          <h3 className="ledger-title-text">Transaction ledger</h3>
          <span className="pill-badge pill-white ledger-count-pill">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* Interactive Filter Dropdown & Segmented Pills */}
        <div className="ledger-filter-wrapper">
          <select 
            className="ledger-filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Filter: All ({transactions.length})</option>
            <option value="earned">Earned (+) ({earnedCount})</option>
            <option value="spent">Spent (-) ({spentCount})</option>
          </select>
        </div>
      </div>

      <div className="ledger-list">
        {loading ? (
          <SkillLoopLoader
            title="Loading Credit Audit Ledger"
            subtitle="Fetching transaction history & token balance from MongoDB..."
            badgeText="MongoDB Live Sync"
            variant="transparent"
          />
        ) : filteredTransactions.length > 0 ? (
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
          <div className="ledger-empty-notice">
            No {filter === 'earned' ? 'earned' : filter === 'spent' ? 'spent' : ''} credit transactions found.
          </div>
        )}
      </div>
    </div>
  );
}
