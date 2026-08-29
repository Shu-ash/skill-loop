// src/admin/components/AdminCreditsLedgerTable.jsx
import React from 'react';

export default function AdminCreditsLedgerTable({ transactions, title = "Transaction History" }) {
  const defaultTransactions = [
    { id: 'tx_901', sender: 'User 1', receiver: 'User 3', amount: '+1 Credit', date: 'Today' },
    { id: 'tx_902', sender: 'User 2', receiver: 'User 1', amount: '-1 Credit', date: 'Today' }
  ];

  const list = transactions || defaultTransactions;

  return (
    <div className="admin-table-card">
      <h3 className="table-header-title">{title}</h3>
      <table className="admin-data-table">
        <thead>
          <tr>
            <th>Tx ID</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {list.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{tx.sender}</td>
              <td>{tx.receiver}</td>
              <td>
                <span className={`pill ${tx.amount.startsWith('+') ? 'pill-earned' : 'pill-spent'}`}>
                  {tx.amount}
                </span>
              </td>
              <td>{tx.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
