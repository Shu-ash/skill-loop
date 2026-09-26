// src/admin/components/AdminCreditsLedgerTable.jsx
import React from 'react';
import SkillLoopLoader from '../../components/SkillLoopLoader';

export default function AdminCreditsLedgerTable({ transactions = [], title = "System Credit Transactions Audit", onViewDetails, loading = false }) {
  const list = Array.isArray(transactions) ? transactions : [];

  return (
    <div className="admin-table-card">
      <div className="table-header-row">
        <h3 className="table-header-title">{title}</h3>
        <span className="admin-count-pill">
          {loading ? 'Loading...' : `${list.length} ${list.length === 1 ? 'transaction' : 'transactions'}`}
        </span>
      </div>

      {loading ? (
        <SkillLoopLoader
          title="Loading Credit Audit Ledger"
          subtitle="Querying platform transactions & credit circulation from MongoDB..."
          badgeText="MongoDB Live Sync"
          variant="transparent"
        />
      ) : list.length === 0 ? (
        <div className="admin-table-empty">
          <span className="admin-table-empty-icon">🪙</span>
          <h4 className="admin-table-empty-title">No Credit Transactions Yet</h4>
          <p className="admin-table-empty-desc">Real member credit transactions will be logged here when sessions are completed.</p>
        </div>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th className="nowrap-cell">Tx ID</th>
              <th>Sender (Learner)</th>
              <th>Receiver (Teacher)</th>
              <th>Credit Amount</th>
              <th>Date</th>
              <th>Description</th>
              {onViewDetails && <th className="nowrap-cell">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {list.map((tx) => {
              const formattedId = tx.displayId || `#TX-${(tx.id || tx._id || '').toString().slice(-6).toUpperCase()}`;
              return (
                <tr key={tx.id || tx._id}>
                  <td className="nowrap-cell">
                    <span className="user-id-badge" title={`Full Transaction ID: ${tx.id || tx._id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td className="nowrap-cell"><strong>{tx.sender || 'Member'}</strong></td>
                  <td className="nowrap-cell"><strong>{tx.receiver || 'Member'}</strong></td>
                  <td className="nowrap-cell">
                    <span className={`pill ${tx.amount?.startsWith('+') ? 'pill-earned' : 'pill-spent'}`}>
                      {tx.amount || '+1 Credit'}
                    </span>
                  </td>
                  <td className="nowrap-cell">{tx.date || 'Recent'}</td>
                  <td><span className="text-subtle">{tx.description || 'Skill Transfer'}</span></td>
                  {onViewDetails && (
                    <td className="nowrap-cell">
                      <div className="table-actions-row">
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => onViewDetails(tx)}
                          title="View Transaction Audit Details"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
