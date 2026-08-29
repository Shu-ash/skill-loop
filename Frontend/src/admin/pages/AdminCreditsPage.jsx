// src/admin/pages/AdminCreditsPage.jsx
import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminCreditsLedgerTable from '../components/AdminCreditsLedgerTable';
import '../admin.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminCreditsPage() {
  const [activeTab, setActiveTab] = useState('credits');
  const [transactions, setTransactions] = useState([
    { id: 'tx_901', sender: 'User 1', receiver: 'User 3', amount: '+1 Credit', date: 'Today' },
    { id: 'tx_902', sender: 'User 2', receiver: 'User 1', amount: '-1 Credit', date: 'Today' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const response = await fetch(`${API_BASE_URL}/admin/credits`, {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
            'x-admin-token': 'admin2026'
          }
        });
        const data = await response.json();
        if (data.success && data.data?.transactions?.length) {
          setTransactions(data.data.transactions);
        }
      } catch (err) {
        console.error('Failed to load admin credits ledger:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, []);

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
              <p>Inspect platform credit transactions and system circulation.</p>
            </div>

            <AdminCreditsLedgerTable transactions={transactions} title="Platform Credit Ledger" />
          </main>
        </div>
      </div>
    </>
  );
}
