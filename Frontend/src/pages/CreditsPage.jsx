// src/pages/CreditsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import CreditBalanceCards from '../components/CreditBalanceCards';
import TransactionLedgerTable from '../components/TransactionLedgerTable';
import CreditsHowItWorksCard from '../components/CreditsHowItWorksCard';

const API_BASE_URL = 'http://localhost:5000/api';

export default function CreditsPage() {
  const [balance, setBalance] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Compute dynamic earned and spent amounts from actual transactions
  const earnedTotal = useMemo(() => {
    return transactions
      .filter(t => t.type === 'earned' || Number(t.amount) > 0)
      .reduce((acc, t) => acc + Math.abs(Number(t.amount) || 1), 0);
  }, [transactions]);

  const spentTotal = useMemo(() => {
    return transactions
      .filter(t => t.type === 'spent' || Number(t.amount) < 0)
      .reduce((acc, t) => acc + Math.abs(Number(t.amount) || 1), 0);
  }, [transactions]);

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
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/credits/my-ledger`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data) {
          if (data.data.credits !== undefined) setBalance(data.data.credits);
          if (Array.isArray(data.data.history)) {
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
        console.log('Credits ledger live fetch error:', err);
      } finally {
        setLoading(false);
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
                <p>Teach to earn. Spend to learn. 100% connected to MongoDB.</p>
              </div>
            </div>

            {/* Component 1: Credit Balance Summary Cards with Dynamic Earned/Spent */}
            <CreditBalanceCards balance={balance} earned={earnedTotal} spent={spentTotal} />

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
