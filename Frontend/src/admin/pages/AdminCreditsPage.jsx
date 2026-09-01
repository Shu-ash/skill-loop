// src/admin/pages/AdminCreditsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminCreditsLedgerTable from '../components/AdminCreditsLedgerTable';
import AdminSearchFilterBar from '../components/AdminSearchFilterBar';
import AdminActionModal from '../components/AdminActionModal';
import '../admin.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminCreditsPage() {
  const [activeTab, setActiveTab] = useState('credits');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');

  // Center Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    icon: '🪙',
    message: '',
    confirmText: 'Close',
    confirmType: 'primary',
    details: null,
    isDetailsOnly: true,
    onConfirm: null,
    loading: false
  });

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
        if (data.success && data.data?.transactions) {
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

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const search = searchQuery.trim().toLowerCase();
      const matchesSearch = !search ||
        (tx.sender && tx.sender.toLowerCase().includes(search)) ||
        (tx.receiver && tx.receiver.toLowerCase().includes(search)) ||
        (tx.note && tx.note.toLowerCase().includes(search)) ||
        (tx.description && tx.description.toLowerCase().includes(search)) ||
        (tx.id && tx.id.toLowerCase().includes(search)) ||
        (tx.displayId && tx.displayId.toLowerCase().includes(search));

      const matchesType = selectedType === 'All Types' ||
        (selectedType === 'Earned (+)' && (tx.amount?.includes('+') || tx.type === 'earned')) ||
        (selectedType === 'Spent (-)' && (tx.amount?.includes('-') || tx.type === 'spent'));

      return matchesSearch && matchesType;
    });
  }, [transactions, searchQuery, selectedType]);

  const handleViewDetails = (tx) => {
    setModalConfig({
      isOpen: true,
      title: '🪙 Credit Transaction Audit Details',
      icon: '🪙',
      message: `Complete transaction breakdown from MongoDB credit ledger.`,
      isDetailsOnly: true,
      details: {
        'Transaction ID': tx.displayId || `#TX-${(tx.id || '').toString().slice(-6).toUpperCase()}`,
        'Sender (Learner)': tx.sender,
        'Receiver (Teacher)': tx.receiver,
        'Credit Amount': tx.amount || '+1 Credit',
        'Date & Time': tx.date || 'Recent',
        'Description': tx.description || 'Skill swap session reward'
      },
      onConfirm: null
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('All Types');
  };

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
              <p>Search, inspect platform credit transactions, and audit system circulation from MongoDB.</p>
            </div>

            {/* Admin Search & Filter Bar */}
            <AdminSearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search transactions by sender, receiver, note, or ID..."
              filters={[
                {
                  label: 'Type',
                  value: selectedType,
                  onChange: setSelectedType,
                  options: ['All Types', 'Earned (+)', 'Spent (-)']
                }
              ]}
              onClearFilters={handleClearFilters}
            />

            <AdminCreditsLedgerTable 
              transactions={filteredTransactions} 
              title={`Platform Credit Ledger (${filteredTransactions.length})`} 
              onViewDetails={handleViewDetails}
            />
          </main>
        </div>
      </div>

      {/* Center Screen Details Modal */}
      <AdminActionModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        icon={modalConfig.icon}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        confirmType={modalConfig.confirmType}
        details={modalConfig.details}
        isDetailsOnly={modalConfig.isDetailsOnly}
        loading={modalConfig.loading}
      />
    </>
  );
}
