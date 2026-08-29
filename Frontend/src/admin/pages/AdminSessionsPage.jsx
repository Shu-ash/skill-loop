// src/admin/pages/AdminSessionsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminSessionsTable from '../components/AdminSessionsTable';
import AdminSearchFilterBar from '../components/AdminSearchFilterBar';
import AdminActionModal from '../components/AdminActionModal';
import '../admin.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminSessionsPage() {
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([]);
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

  const fetchSessions = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sessions`, {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'x-admin-token': 'admin2026'
        }
      });
      const data = await response.json();
      if (data.success && data.data?.sessions?.length) {
        setSessions(data.data.sessions);
      }
    } catch (err) {
      console.error('Failed to load admin sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const search = searchQuery.trim().toLowerCase();
      const matchesSearch = !search ||
        (s.topic && s.topic.toLowerCase().includes(search)) ||
        (s.teacher && s.teacher.toLowerCase().includes(search)) ||
        (s.learner && s.learner.toLowerCase().includes(search)) ||
        (s.id && s.id.toLowerCase().includes(search)) ||
        (s.displayId && s.displayId.toLowerCase().includes(search));

      const matchesStatus = selectedStatus === 'All Status' ||
        (s.status && s.status.toLowerCase() === selectedStatus.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [sessions, searchQuery, selectedStatus]);

  const handleResolveDisputeClick = (s) => {
    setModalConfig({
      isOpen: true,
      title: '⚖️ Resolve Session Dispute',
      icon: '⚖️',
      message: `Reviewing dispute for session "${s.topic}". Resolving this will mark the session as Completed and transfer the skill swap credit to the Teacher.`,
      confirmText: 'Award Credit to Teacher & Resolve',
      confirmType: 'primary',
      details: {
        'Topic / Skill': s.topic || 'Skill Swap',
        'Session ID': s.displayId || `#SES-${(s.id || '').toString().slice(-6).toUpperCase()}`,
        'Teacher': s.teacher,
        'Learner': s.learner,
        'Current Status': '⚠️ Disputed',
        'Resolution Action': 'Mark Completed & Award Credit'
      },
      isDetailsOnly: false,
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, loading: true }));
        const token = localStorage.getItem('accessToken');
        try {
          const response = await fetch(`${API_BASE_URL}/admin/sessions/${s.id}/dispute`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token || ''}`,
              'x-admin-token': 'admin2026'
            },
            body: JSON.stringify({ resolution: 'Resolved by Admin', awardTo: 'teacher' })
          });
          if (response.ok) {
            setSessions(prev => prev.map(item => item.id === s.id ? { ...item, status: 'Completed' } : item));
          }
        } catch (err) {
          console.error('Failed to resolve dispute:', err);
        }
        setModalConfig(prev => ({ ...prev, isOpen: false, loading: false }));
      }
    });
  };

  const handleViewDetails = (s) => {
    setModalConfig({
      isOpen: true,
      title: '📋 Session Audit Log Details',
      icon: '🎥',
      message: `Complete metadata and audit trail for swap session #${s.id.slice(-6).toUpperCase()}.`,
      isDetailsOnly: true,
      details: {
        'Topic / Skill': s.topic || 'Skill Swap',
        'Session ID': s.displayId || `#SES-${(s.id || '').toString().slice(-6).toUpperCase()}`,
        'Teacher': s.teacher,
        'Learner': s.learner,
        'Duration': `${s.duration || 45} minutes`,
        'Mode': s.mode || 'Online Video Call',
        'Status': s.status || 'Scheduled'
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
              <h2>Sessions &amp; Disputes</h2>
              <p>Search, monitor live swap sessions, review meet logs, and resolve member disputes.</p>
            </div>

            {/* Admin Search & Filter Bar */}
            <AdminSearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search sessions by topic, teacher, learner, or session ID..."
              filters={[
                {
                  label: 'Status',
                  value: selectedStatus,
                  onChange: setSelectedStatus,
                  options: ['All Status', 'Scheduled', 'Completed', 'Disputed', 'Cancelled']
                }
              ]}
              onClearFilters={handleClearFilters}
            />

            <AdminSessionsTable 
              sessions={filteredSessions} 
              title={`Session Audit Logs (${filteredSessions.length})`} 
              onResolveDispute={handleResolveDisputeClick}
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
