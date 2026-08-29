// src/admin/components/AdminCreditsLedgerTable.jsx
import React from 'react';

export default function AdminCreditsLedgerTable({ transactions, title = "System Credit Transactions Audit", onViewDetails, loading = false }) {
  const defaultTransactions = [
    { id: 'tx_901', displayId: '#TX-000901', sender: 'Priya Verma', receiver: 'Aarav Sharma', amount: '+1 Credit', date: 'Today', description: 'React Components session reward' },
    { id: 'tx_902', displayId: '#TX-000902', sender: 'Ananya Iyer', receiver: 'Rohan Gupta', amount: '+1 Credit', date: 'Yesterday', description: 'Node.js REST API session reward' }
  ];

  const list = (transactions && transactions.length > 0) ? transactions : (!loading && transactions !== undefined && transactions.length === 0 ? [] : defaultTransactions);

  return (
    <div className="admin-table-card">
      <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="table-header-title" style={{ margin: 0 }}>{title}</h3>
        <span className="admin-count-pill" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem', borderRadius: '12px', background: 'rgba(108, 92, 231, 0.1)', color: 'var(--violet-primary, #6c5ce7)', fontWeight: 600 }}>
          {loading ? 'Loading...' : `${list.length} ${list.length === 1 ? 'transaction' : 'transactions'}`}
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
          Loading credit audit ledger from MongoDB...
        </div>
      ) : list.length === 0 ? (
        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
          No matching transactions found.
        </div>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Tx ID</th>
              <th>Sender (Learner)</th>
              <th>Receiver (Teacher)</th>
              <th>Credit Amount</th>
              <th>Date</th>
              <th>Description</th>
              {onViewDetails && <th style={{ whiteSpace: 'nowrap' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {list.map((tx) => {
              const formattedId = tx.displayId || `#TX-${(tx.id || '').toString().slice(-6).toUpperCase()}`;
              return (
                <tr key={tx.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="user-id-badge" title={`Full Transaction ID: ${tx.id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}><strong>{tx.sender}</strong></td>
                  <td style={{ whiteSpace: 'nowrap' }}><strong>{tx.receiver}</strong></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className={`pill ${tx.amount?.startsWith('+') ? 'pill-earned' : 'pill-spent'}`}>
                      {tx.amount || '+1 Credit'}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{tx.date || 'Recent'}</td>
                  <td><span className="text-subtle">{tx.description || 'Skill Transfer'}</span></td>
                  {onViewDetails && (
                    <td style={{ whiteSpace: 'nowrap' }}>
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
