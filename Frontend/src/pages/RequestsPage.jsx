// src/pages/RequestsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import RequestsTabNav from '../components/RequestsTabNav';
import RequestCard from '../components/RequestCard';
import ScheduleSessionModal from '../components/ScheduleSessionModal';

const API_URL = 'http://localhost:5000/api';

const EMPTY_REQUESTS = {
  received: [],
  sent: [],
  accepted: [],
  history: []
};

export default function RequestsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('received');
  const [requests, setRequests] = useState(EMPTY_REQUESTS);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Schedule Modal State for Teacher
  const [scheduleModal, setScheduleModal] = useState({
    open: false,
    request: null,
    loading: false
  });

  const getToken = () => {
    return localStorage.getItem('accessToken');
  };

  const formatUser = (user) => {
    if (!user) {
      return {
        name: 'Skill Loop User',
        avatar: 'SL',
        avatarBg: 'var(--violet-primary)'
      };
    }

    const name =
      user.name ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.username ||
      'Skill Loop User';

    const avatar =
      name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'SL';

    return {
      name,
      avatar,
      avatarBg: 'var(--violet-primary)',
      profilePhotoUrl: user.profilePhotoUrl || ''
    };
  };

  const formatRequest = (backendRequest, direction) => {
    const isReceived = direction === 'received';
    const partner = isReceived
      ? backendRequest.sender
      : backendRequest.receiver;

    return {
      id: backendRequest._id,
      requestId: backendRequest._id,
      user: formatUser(partner),
      skillWant: backendRequest.skillWant || '',
      message: backendRequest.message || '',
      status: backendRequest.status || 'pending',
      createdAt: backendRequest.createdAt,
      timeAgo: formatTimeAgo(backendRequest.createdAt)
    };
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const created = new Date(date).getTime();
    if (Number.isNaN(created)) return '';

    const diff = Date.now() - created;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const loadRequests = async () => {
    // Purge any stale localstorage remnants
    try {
      localStorage.removeItem('skillloop_user_requests');
    } catch (e) {}

    const token = getToken();

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const headers = { Authorization: `Bearer ${token}` };

      const [receivedResponse, sentResponse] = await Promise.all([
        fetch(`${API_URL}/requests/received`, { headers, credentials: 'include' }),
        fetch(`${API_URL}/requests/sent`, { headers, credentials: 'include' })
      ]);

      if (receivedResponse.status === 401 || sentResponse.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('skillloop_user');
        navigate('/login');
        return;
      }

      const receivedData = await receivedResponse.json();
      const sentData = await sentResponse.json();

      const backendReceived = receivedData?.data?.requests || [];
      const backendSent = sentData?.data?.requests || [];

      // Extract accepted requests for accepted tab
      const acceptedReceived = backendReceived.filter(r => r.status === 'accepted').map(r => formatRequest(r, 'received'));
      const acceptedSent = backendSent.filter(r => r.status === 'accepted').map(r => formatRequest(r, 'sent'));

      setRequests({
        received: backendReceived.filter(r => r.status === 'pending').map((r) => formatRequest(r, 'received')),
        sent: backendSent.filter(r => r.status === 'pending').map((r) => formatRequest(r, 'sent')),
        accepted: [...acceptedReceived, ...acceptedSent],
        history: []
      });

    } catch (err) {
      console.error('Failed to load requests from MongoDB:', err);
      setRequests(EMPTY_REQUESTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Open Schedule Modal when Teacher accepts
  const handleOpenAcceptModal = (request) => {
    setScheduleModal({
      open: true,
      request,
      loading: false
    });
  };

  const handleCloseAcceptModal = () => {
    setScheduleModal({
      open: false,
      request: null,
      loading: false
    });
  };

  // Submit Schedule & Accept Request
  const handleSubmitSchedule = async ({ scheduledAt, duration, mode, meetLink, message }) => {
    const token = getToken();
    const requestId = scheduleModal.request?.id || scheduleModal.request?.requestId;

    if (!token || !requestId) {
      return;
    }

    try {
      setScheduleModal(prev => ({ ...prev, loading: true }));
      setError('');
      setSuccessMsg('');

      const response = await fetch(`${API_URL}/requests/${requestId}/accept`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          scheduledAt,
          duration,
          mode,
          meetLink,
          message
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept and schedule session');
      }

      handleCloseAcceptModal();
      setSuccessMsg('🎉 Swap request accepted & live session scheduled! Check the Sessions tab.');
      await loadRequests();

      // Automatically navigate to Sessions page after 1.5s
      setTimeout(() => {
        navigate('/sessions');
      }, 1500);

    } catch (err) {
      console.error('Failed to schedule session on accept:', err);
      setError(err.message || 'Failed to schedule session');
      setScheduleModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleReject = async (request) => {
    const token = getToken();
    const requestId = request.id || request.requestId;

    if (!token || !requestId) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/requests/${requestId}/reject`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject request');
      }

      await loadRequests();
    } catch (err) {
      console.error('Failed to reject request:', err);
      setError(err.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (request) => {
    const token = getToken();
    const requestId = request.id || request.requestId;

    if (!token || !requestId) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/requests/${requestId}/cancel`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel request');
      }

      await loadRequests();
    } catch (err) {
      console.error('Failed to cancel request:', err);
      setError(err.message || 'Failed to cancel request');
    } finally {
      setActionLoading(false);
    }
  };

  const currentList = requests[activeTab] || [];

  return (
    <>
      <div className="liquid-bg">
        <div className="liquid-blob blob-1" />
        <div className="liquid-blob blob-2" />
        <div className="liquid-blob blob-3" />
      </div>

      <div id="app">
        <Navbar />

        <div className="app-layout">
          <Sidebar />

          <main className="main-content">
            <div className="page-title-row">
              <div>
                <h2>Swap requests inbox</h2>
                <p>
                  Manage skill swap requests and schedule interactive learning sessions.
                </p>
              </div>
            </div>

            {error && (
              <div className="glass-panel onboarding-error-banner">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="glass-panel" style={{ background: 'rgba(46, 204, 113, 0.12)', color: '#27ae60', border: '1px solid rgba(46, 204, 113, 0.3)', padding: '0.85rem 1.2rem', borderRadius: '14px', marginBottom: '1.2rem', fontWeight: 600 }}>
                {successMsg}
              </div>
            )}

            <RequestsTabNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={{
                received: requests.received.length,
                sent: requests.sent.length,
                accepted: requests.accepted.length,
                history: requests.history.length
              }}
            />

            <div className="requests-container">
              {loading ? (
                <div className="glass-panel empty-requests-card">
                  Loading requests from MongoDB...
                </div>
              ) : currentList.length > 0 ? (
                <div className="requests-list">
                  {currentList.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      tab={activeTab}
                      onAccept={handleOpenAcceptModal}
                      onReject={handleReject}
                      onCancel={handleCancel}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-panel empty-requests-card">
                  <h3>No {activeTab} requests</h3>
                  <p>
                    {activeTab === 'received'
                      ? 'You have no incoming skill swap proposals right now.'
                      : activeTab === 'sent'
                        ? 'You have not sent any pending swap requests yet.'
                        : activeTab === 'accepted'
                          ? 'No accepted swaps yet. Accept requests to schedule live classes!'
                          : 'No completed or cancelled request history.'}
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>

        <MobileNav />

        {/* Schedule & Meeting Link Modal for Teacher */}
        <ScheduleSessionModal
          isOpen={scheduleModal.open}
          request={scheduleModal.request}
          onClose={handleCloseAcceptModal}
          onSubmit={handleSubmitSchedule}
          loading={scheduleModal.loading}
        />
      </div>
    </>
  );
}