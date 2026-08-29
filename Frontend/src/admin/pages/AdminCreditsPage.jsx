// src/admin/pages/AdminCreditsPage.jsx
import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminCreditsLedgerTable from '../components/AdminCreditsLedgerTable';
import '../admin.css';

export default function AdminCreditsPage() {
  const [activeTab, setActiveTab] = useState('credits');

  const transactions = [
    { id: 'tx_901', sender: 'User 1', receiver: 'User 3', amount: '+1 Credit', date: 'Today' },
    { id: 'tx_902', sender: 'User 2', receiver: 'User 1', amount: '-1 Credit', date: 'Today' }
  ];

  return (
    <>
      <div className="liquid-bg">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
      </div>

      <div className="admin-page-container">
        <AdminNavbar />

        <div className="admin-layout">
          <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

          <main className="admin-main-content">
            <div className="page-header">
              <h2>Credit Audit Ledger</h2>
              <p>Inspect platform credit transactions.</p>
            </div>

            <AdminCreditsLedgerTable transactions={transactions} title="Platform Credit Ledger" />
          </main>
        </div>
      </div>
    </>
  );
}
