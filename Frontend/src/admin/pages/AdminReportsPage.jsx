// src/admin/pages/AdminReportsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminReportsTable from '../components/AdminReportsTable';
import AdminSearchFilterBar from '../components/AdminSearchFilterBar';
import AdminActionModal from '../components/AdminActionModal';
import '../admin.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Center Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    icon: '⚠️',
    message: '',
    confirmText: 'Confirm',
    confirmType: 'primary',
    details: null,
    isDetailsOnly: false,
    onConfirm: null,
    loading: false
  });

  const fetchReports = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports`, {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'x-admin-token': 'admin2026'
        }
      });
      const data = await response.json();
      if (data.success && data.data?.reports) {
        setReports(data.data.reports);
      }
    } catch (err) {
      console.error('Failed to load admin reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const search = searchQuery.trim().toLowerCase();
      const matchesSearch = !search ||
        (r.reporterName && r.reporterName.toLowerCase().includes(search)) ||
        (r.reportedName && r.reportedName.toLowerCase().includes(search)) ||
        (r.reason && r.reason.toLowerCase().includes(search)) ||
        (r.id && r.id.toLowerCase().includes(search)) ||
        (r.displayId && r.displayId.toLowerCase().includes(search));

      const matchesStatus = selectedStatus === 'All Status' ||
        (r.status && r.status.toLowerCase() === selectedStatus.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchQuery, selectedStatus]);

  const handleResolveReportClick = (r, resolutionAction) => {
    const isResolving = resolutionAction === 'resolved';

    setModalConfig({
      isOpen: true,
      title: isResolving ? '✅ Mark Report Resolved' : '🚫 Dismiss Report',
      icon: isResolving ? '✅' : '🚫',
      message: isResolving
        ? `Are you sure you want to mark this report against "${r.reportedName}" as Resolved?`
        : `Are you sure you want to dismiss this report without action?`,
      confirmText: isResolving ? 'Yes, Resolve Report' : 'Dismiss Report',
      confirmType: isResolving ? 'success' : 'warning',
      details: {
        'Report ID': r.displayId || `#REP-${(r.id || '').toString().slice(-6).toUpperCase()}`,
        'Reported By': r.reporterName || 'Member',
        'Reported Member': r.reportedName || 'User',
        'Reason for Flag': r.reason || 'Community violation',
        'Action': isResolving ? 'Resolve & Log' : 'Dismiss Report'
      },
      isDetailsOnly: false,
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, loading: true }));
        const token = localStorage.getItem('accessToken');
        try {
          const response = await fetch(`${API_BASE_URL}/admin/reports/${r.id}/resolve`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token || ''}`,
              'x-admin-token': 'admin2026'
            },
            body: JSON.stringify({ status: resolutionAction })
          });
          if (response.ok) {
            setReports(prev => prev.map(item => item.id === r.id ? { ...item, status: isResolving ? 'Resolved' : 'Dismissed' } : item));
          }
        } catch (err) {
          console.error('Failed to resolve report:', err);
        }
        setModalConfig(prev => ({ ...prev, isOpen: false, loading: false }));
      }
    });
  };

  const handleViewDetails = (r) => {
    setModalConfig({
      isOpen: true,
      title: '🚨 Moderation Report Details',
      icon: '📋',
      message: `Full incident breakdown for report #${r.id.slice(-6).toUpperCase()}.`,
      isDetailsOnly: true,
      details: {
        'Report ID': r.displayId || `#REP-${(r.id || '').toString().slice(-6).toUpperCase()}`,
        'Reporter': r.reporterName || 'Member',
        'Reported User': r.reportedName || 'User',
        'Violation Category': r.reason || 'Spam / Misconduct',
        'Status': r.status || 'Pending'
      },
      onConfirm: null
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All Status');
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
              <h2>Moderation Queue</h2>
              <p>Search, review member reports, flagged content, and community violations.</p>
            </div>

            {/* Admin Search & Filter Bar */}
            <AdminSearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search reports by reporter, reported user, reason, or ID..."
              filters={[
                {
                  label: 'Status',
                  value: selectedStatus,
                  onChange: setSelectedStatus,
                  options: ['All Status', 'Pending', 'Resolved', 'Dismissed']
                }
              ]}
              onClearFilters={handleClearFilters}
            />

            <AdminReportsTable 
              reports={filteredReports} 
              title={`Pending Moderation Queue (${filteredReports.length})`} 
              onResolveReport={handleResolveReportClick}
              onViewDetails={handleViewDetails}
            />
          </main>
        </div>
      </div>

      {/* Center Screen Confirmation & Details Modal */}
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
