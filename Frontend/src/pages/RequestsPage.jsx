import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import RequestsTabNav from '../components/RequestsTabNav';
import RequestCard from '../components/RequestCard';

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

      const receivedData = await receivedResponse.json();
      const sentData = await sentResponse.json();

      const backendReceived = receivedData?.data?.requests || [];
      const backendSent = sentData?.data?.requests || [];

      const formattedSent = [
        ...backendSent.map((r) => formatRequest(r, 'sent')),
        ...localSent.filter(ls => !backendSent.some(bs => bs._id === ls.id))
      ];

      setRequests({
        received: backendReceived.map((r) => formatRequest(r, 'received')),
        sent: formattedSent,
        accepted: [],
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

  const handleAccept = async (requestId) => {
    const token = getToken();

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/requests/${requestId}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept request');
      }

      const acceptedRequest = data?.data?.request;
      const createdSession = data?.data?.session;

      setRequests((current) => ({
        ...current,
        received: current.received.filter((r) => r.id !== requestId),
        accepted: acceptedRequest
          ? [
              {
                ...formatRequest(acceptedRequest, 'received'),
                status: 'accepted',
                sessionId: createdSession?._id || ''
              },
              ...current.accepted
            ]
          : current.accepted
      }));

      setActiveTab('accepted');

    } catch (err) {
      console.error('Accept request failed:', err);
      setError(err.message || 'Failed to accept request');
    } finally {
      setActionLoading(false);
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
    if (!request) return;

    if (request.sessionId) {
      localStorage.setItem('activeSessionId', request.sessionId);
    }

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
                <p>Manage everything you've sent and received from peers.</p>
              </div>
            </div>

            {error && (
              <div className="glass-panel onboarding-error-banner">
                {error}
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
                  Loading requests...
                </div>
              ) : currentList.length > 0 ? (
                currentList.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    direction={activeTab}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onSchedule={handleSchedule}
                    actionLoading={actionLoading}
                  />
                ))
              ) : (
                <div className="glass-panel empty-requests-card">
                  <p>No requests found in this tab.</p>
                </div>
              )}
            </div>
          </main>
        </div>

        <MobileNav />
      </div>
    </>
  );
}