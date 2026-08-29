// src/pages/CreditsPage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import CreditBalanceCards from '../components/CreditBalanceCards';
import TransactionLedgerTable from '../components/TransactionLedgerTable';
import CreditsHowItWorksCard from '../components/CreditsHowItWorksCard';

const API_BASE_URL = 'http://localhost:5000/api';

const MOCK_TRANSACTIONS = [
  { id: 'tx_1', type: 'earned', title: 'Taught React Hooks to Devon Patel', date: 'Aug 10, 2026', sessionId: '0142', amount: 1 },
  { id: 'tx_2', type: 'spent', title: 'Learned Spanish from Lena Kim', date: 'Aug 7, 2026', sessionId: '0139', amount: -1 },
  { id: 'tx_3', type: 'earned', title: 'Taught Guitar Basics to Nina Byrne', date: 'Aug 3, 2026', sessionId: '0133', amount: 1 },
  { id: 'tx_4', type: 'spent', title: 'Learned Figma from Sara Park', date: 'Jul 29, 2026', sessionId: '0121', amount: -1 },
  { id: 'tx_5', type: 'earned', title: 'Taught JavaScript to Riya Anand', date: 'Jul 24, 2026', sessionId: '0118', amount: 1 }
];

export default function CreditsPage() {
  const [balance, setBalance] = useState(3);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);

  useEffect(() => {
    const userStr = localStorage.getItem('skillloop_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.credits !== undefined) setBalance(u.credits);
      } catch (e) {
        console.error(e);
      }
    }

    const fetchLedger = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/credits/my-ledger`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data) {
          if (data.data.credits !== undefined) setBalance(data.data.credits);
          if (data.data.history?.length) {
            const formatted = data.data.history.map(h => ({
              id: h.id,
              type: h.type,
              title: `${h.type === 'earned' ? 'Taught to' : 'Learned from'} ${h.partnerName}`,
              date: h.date,
              sessionId: h.displayId,
              amount: h.type === 'earned' ? 1 : -1
            }));
            setTransactions(formatted);
          }
        }
      } catch (err) {
        console.log('Credits ledger fallback active');
      }
    };

    fetchLedger();
  }, []);

  return (
    <>
      <div className="liquid-bg">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
      </div>

      <div id="app">
        <Navbar />

        <div className="app-layout">
          <Sidebar />

          <main className="main-content">
            <div className="page-title-row">
              <div>
                <h2>Skill Credits — Balance &amp; Ledger</h2>
                <p>Teach to earn. Spend to learn. Always auditable.</p>
              </div>
            </div>

            {/* Component 1: Credit Balance Summary Cards */}
            <CreditBalanceCards balance={balance} earned={12} spent={9} />

            {/* Grid Layout for Ledger & Explainer */}
            <div className="credits-body-grid">
              {/* Component 2: Transaction Ledger Table */}
              <TransactionLedgerTable transactions={transactions} />

              {/* Component 3: How Credits Work Card */}
              <CreditsHowItWorksCard />
            </div>
          </main>
        </div>

        <MobileNav />
      </div>
    </>
  );
}
