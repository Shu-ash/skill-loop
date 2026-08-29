// src/admin/components/AdminCreditsLedgerTable.jsx
import React from 'react';

export default function AdminCreditsLedgerTable({ transactions, title = "System Credit Transactions Audit" }) {
  const defaultTransactions = [
    { id: 'tx_901', displayId: '#TX-000901', sender: 'Priya Verma', receiver: 'Aarav Sharma', amount: '+1 Credit', date: 'Today', description: 'React Hooks Skill Swap' },
    { id: 'tx_902', displayId: '#TX-000902', sender: 'Sneha Patel', receiver: 'Rohan Gupta', amount: '+1 Credit', date: 'Yesterday', description: 'Python Skill Swap' }
  ];

  const list = transactions?.length ? transactions : defaultTransactions;

  return (
    <div className="admin-table-card">
      <h3 className="table-header-title">{title}</h3>
      <table className="admin-data-table">
        <thead>
          <tr>
            <th>Tx ID</th>
            <th>Sender (Learner)</th>
            <th>Receiver (Teacher)</th>
            <th>Credit Amount</th>
            <th>Date</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {list.map((tx) => {
            const formattedId = tx.displayId || `#TX-${(tx.id || '').toString().slice(-6).toUpperCase()}`;
            return (
              <tr key={tx.id}>
                <td>
                  <span className="user-id-badge" title={`Full Transaction ID: ${tx.id}`}>
                    {formattedId}
                  </span>
                </td>
                <td><strong>{tx.sender}</strong></td>
                <td><strong>{tx.receiver}</strong></td>
                <td>
                  <span className={`pill ${tx.amount?.startsWith('+') ? 'pill-earned' : 'pill-spent'}`}>
                    {tx.amount || '+1 Credit'}
                  </span>
                </td>
                <td>{tx.date || 'Recent'}</td>
                <td><span className="text-subtle">{tx.description || 'Skill Transfer'}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
