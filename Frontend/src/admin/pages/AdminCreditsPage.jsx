// src/admin/pages/AdminCreditsPage.jsx
import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import '../admin.css';

export default function AdminCreditsPage() {
  const [activeTab, setActiveTab] = useState('credits');

  // Simple static transaction list
  const transactions = [
    { id: 'tx_901', sender: 'User 1', receiver: 'User 3', amount: '+1 Credit', date: 'Today' },
    { id: 'tx_902', sender: 'User 2', receiver: 'User 1', amount: '-1 Credit', date: 'Today' }
  ];

  return (
    <div className="admin-page-container">
      {/* Top Navbar */}
      <AdminNavbar />

      <div className="admin-layout">
        {/* Simple Fixed Sidebar */}
        <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Main Credits Content */}
        <main className="admin-main-content">
          <div className="page-header">
            <h2>Credit Audit Ledger</h2>
            <p>Inspect platform credit transactions.</p>
          </div>

          {/* Credits Table */}
          <div className="admin-table-card">
            <h3 className="table-header-title">Transaction History</h3>
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
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.id}</td>
                    <td>{tx.sender}</td>
                    <td>{tx.receiver}</td>
                    <td>{tx.amount}</td>
                    <td>{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
