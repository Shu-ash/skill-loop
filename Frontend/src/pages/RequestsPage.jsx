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
    const partner = isReceived ? backendRequest.sender : backendRequest.receiver;

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
    const token = getToken();

    let localSent = [];
    try {
      const stored = localStorage.getItem('skillloop_user_requests');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localSent = parsed.map(r => ({
            id: r.id || `req_${Date.now()}`,
            user: { name: r.targetUser?.name || 'Peer Member', avatar: r.targetUser?.avatar || 'PM', avatarBg: 'var(--violet-primary)' },
            skillWant: r.skillWant || 'Skill Swap',
            message: r.message || '',
            status: r.status || 'pending',
            timeAgo: r.createdAt || 'Recent'
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }

    if (!token) {
      setRequests({
        received: [],
        sent: localSent,
        accepted: [],
        history: []
      });
      setLoading(false);
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

      const formattedSent = [
        ...backendSent.map((r) => formatRequest(r, 'sent')),
        ...localSent.filter(ls => !backendSent.some(bs => bs._id === ls.id))
      ];

      // Extract accepted requests for accepted tab
      const acceptedReceived = backendReceived.filter(r => r.status === 'accepted').map(r => formatRequest(r, 'received'));
      const acceptedSent = backendSent.filter(r => r.status === 'accepted').map(r => formatRequest(r, 'sent'));

      setRequests({
        received: backendReceived.filter(r => r.status === 'pending').map((r) => formatRequest(r, 'received')),
        sent: formattedSent,
        accepted: [...acceptedReceived, ...acceptedSent],
        history: []
      });

    } catch (err) {
      console.log('Failed to load live requests, fallback active');
      setRequests({
        received: [],
        sent: localSent,
        accepted: [],
        history: []
      });
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

  // Submit Schedule & Accept by Teacher
  const handleConfirmSchedule = async (schedulePayload) => {
    const token = getToken();

    if (!token) {
      navigate('/login');
      return;
    }

    setScheduleModal(prev => ({ ...prev, loading: true }));
    setError('');

    try {
      const response = await fetch(`${API_URL}/requests/${schedulePayload.requestId}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          scheduledAt: schedulePayload.scheduledAt,
          duration: schedulePayload.duration,
          mode: schedulePayload.mode,
          meetLink: schedulePayload.meetLink,
          message: schedulePayload.message
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept request & schedule session');
      }

      setScheduleModal({ open: false, request: null, loading: false });
      setSuccessMsg('Session scheduled successfully! Redirecting to your active sessions...');

      setTimeout(() => {
        navigate('/sessions');
      }, 1200);

    } catch (err) {
      console.error('Accept & schedule error:', err);
      setError(err.message || 'Failed to schedule session');
      setScheduleModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDecline = async (requestId) => {
    const token = getToken();

    if (!token) {
      navigate('/login');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to decline this request?');
    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/requests/${requestId}/decline`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to decline request');
      }

      setRequests((current) => ({
        ...current,
        received: current.received.filter((r) => r.id !== requestId)
      }));

    } catch (err) {
      console.error('Decline request failed:', err);
      setError(err.message || 'Failed to decline request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSchedule = (request) => {
    navigate('/sessions');
  };

  const currentList = requests[activeTab] || [];

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
                <h2>Swap requests inbox</h2>
                <p>Manage skill swap requests and schedule interactive learning sessions.</p>
              </div>
            </div>

            {error && (
              <div className="glass-panel onboarding-error-banner margin-bottom-xs">
                ⚠️ {error}
              </div>
            )}

            {successMsg && (
              <div className="profile-save-banner margin-bottom-xs" style={{ background: '#ecfdf5', color: '#10b981', padding: '0.85rem', borderRadius: '14px', textAlign: 'center', fontWeight: 700 }}>
                ✓ {successMsg}
              </div>
            )}

            <RequestsTabNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              counts={{
                received: requests.received.length,
                sent: requests.sent.length,
                accepted: requests.accepted.length
              }}
            />

            <div className="requests-list-wrapper">
              {loading ? (
                <div className="glass-panel empty-requests-card">
                  Loading requests from MongoDB...
                </div>
              ) : currentList.length > 0 ? (
                currentList.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    direction={activeTab}
                    onAccept={() => handleOpenAcceptModal(request)}
                    onDecline={handleDecline}
                    onSchedule={handleSchedule}
                    actionLoading={actionLoading}
                  />
                ))
              ) : (
                <div className="glass-panel empty-requests-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', borderRadius: '24px' }}>
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>
                    {activeTab === 'received' ? '📬' : activeTab === 'sent' ? '📤' : '🤝'}
                  </span>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 700, color: 'var(--slate-800)' }}>
                    No {activeTab} requests
                  </h3>
                  <p style={{ color: 'var(--slate-500)', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto', lineHeight: '1.6' }}>
                    {activeTab === 'received' 
                      ? 'When peers want to learn skills from you, their swap invitations will appear here.'
                      : activeTab === 'sent'
                      ? 'You have not sent any skill swap requests yet. Visit Browse Skills to request a class!'
                      : 'Accepted and scheduled skill sessions will appear here.'}
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>

        <MobileNav />
      </div>

      {/* Schedule Session Modal for Teacher */}
      <ScheduleSessionModal
        isOpen={scheduleModal.open}
        request={scheduleModal.request}
        onClose={() => setScheduleModal({ open: false, request: null, loading: false })}
        onConfirmSchedule={handleConfirmSchedule}
        loading={scheduleModal.loading}
      />
    </>
  );
}