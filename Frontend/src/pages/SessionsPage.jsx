// src/pages/SessionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import SessionCard from '../components/SessionCard';
import { fetchWithAuth, getAuthStatus } from '../utils/auth';

const API_URL = 'http://localhost:5000/api';
const ALLOWED_DURATIONS = [15, 30, 45, 60, 90, 120];

export default function SessionsPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const getCurrentUser = () => {
    try {
      const storedUser = localStorage.getItem('skillloop_user');
      if (!storedUser) return null;
      return JSON.parse(storedUser);
    } catch (err) {
      console.error('Failed to parse user:', err);
      return null;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not scheduled';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return 'Not scheduled';

    return parsedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date) return 'Not scheduled';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return 'Not scheduled';

    return parsedDate.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatSession = (backendSession, user) => {
    if (!backendSession) return null;

    const teacher = backendSession.teacher || {};
    const learner = backendSession.learner || {};

    const userId = user?._id || user?.id || user?.userId;
    const teacherId = teacher?._id || teacher?.id;
    const learnerId = learner?._id || learner?.id;

    const isTeacher = Boolean(userId && teacherId && String(userId) === String(teacherId));
    const isLearner = Boolean(userId && learnerId && String(userId) === String(learnerId));

    const partner = isTeacher ? learner : teacher;
    const partnerName =
      partner?.name ||
      partner?.username ||
      `${partner?.firstName || ''} ${partner?.lastName || ''}`.trim() ||
      'Skill Loop User';

    const partnerAvatar =
      partnerName
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'SL';

    return {
      id: backendSession._id || backendSession.id,
      isTeacher,
      isLearner,
      learnerJoined: Boolean(backendSession.learnerJoined),
      teacherJoined: Boolean(backendSession.teacherJoined),
      scheduledAt: backendSession.scheduledAt || null,
      title: `${backendSession.skill || 'Skill'} Session`,
      partnerName,
      partnerAvatar,
      date: formatDate(backendSession.scheduledAt),
      time: formatTime(backendSession.scheduledAt),
      mode: backendSession.mode === 'in_person' ? 'In Person' : 'Online Video Call',
      meetLink: backendSession.meetLink || '',
      duration: Number(backendSession.duration) || 45,
      status: backendSession.status,
      skill: backendSession.skill,
      message: backendSession.message || ''
    };
  };

  const loadSessions = async (userOverride = currentUser) => {
    const { isAuthenticated } = getAuthStatus();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setError('');

      const response = await fetchWithAuth(`${API_URL}/sessions`, {
        method: 'GET'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load sessions');
      }

      const backendSessions = data?.data?.sessions || [];
      const formattedSessions = backendSessions
        .map((item) => formatSession(item, userOverride))
        .filter(Boolean);

      setSessions(formattedSessions);

    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    loadSessions(user);

    // Auto-refresh sessions every 5s so when student joins, teacher screen updates live
    const pollInterval = setInterval(() => {
      loadSessions(user);
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  const updateSessionInState = (backendSession) => {
    if (!backendSession) return;
    const formattedSession = formatSession(backendSession, currentUser);
    if (!formattedSession) return;

    setSessions((previousSessions) =>
      previousSessions.map((item) =>
        String(item.id) === String(formattedSession.id) ? formattedSession : item
      )
    );
  };

  const handleJoinCall = async (session) => {
    const meetLink = typeof session === 'string' ? session : session?.meetLink;
    const sessionId = typeof session === 'object' ? session?.id : null;

    if (!meetLink) {
      setError('Meeting link is not available.');
      return;
    }

    // Call backend to record join timestamp & learnerJoined status
    if (sessionId) {
      try {
        fetchWithAuth(`${API_URL}/sessions/${sessionId}/join`, {
          method: 'PATCH'
        }).then(() => loadSessions(currentUser)).catch(() => {});
      } catch (e) {}
    }

    const normalizedLink =
      meetLink.startsWith('http://') || meetLink.startsWith('https://')
        ? meetLink
        : `https://${meetLink}`;

    window.open(normalizedLink, '_blank', 'noopener,noreferrer');
  };

  const handleStartSession = async (sessionId) => {
    try {
      setActionLoading(true);
      setError('');

      const response = await fetchWithAuth(`${API_URL}/sessions/${sessionId}/start`, {
        method: 'PATCH'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start session');
      }

      const updatedSession = data?.data?.session;
      if (updatedSession) {
        updateSessionInState(updatedSession);
      } else {
        await loadSessions(currentUser);
      }
    } catch (err) {
      console.error('Failed to start session:', err);
      setError(err.message || 'Failed to start session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleSession = async (sessionId, scheduledAt, mode, meetLink, duration) => {
    const selectedDuration = Number(duration);
    if (!ALLOWED_DURATIONS.includes(selectedDuration)) {
      setError('Duration must be 15, 30, 45, 60, 90, or 120 minutes.');
      return;
    }

    if (!scheduledAt) {
      setError('Please select a date and time.');
      return;
    }

    if (mode === 'online' && !meetLink?.trim()) {
      setError('Meeting link is required for online sessions.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      const response = await fetchWithAuth(`${API_URL}/sessions/${sessionId}/schedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scheduledAt,
          mode,
          meetLink: mode === 'online' ? meetLink.trim() : '',
          duration: selectedDuration
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to schedule session');
      }

      const updatedSession = data?.data?.session;
      if (updatedSession) {
        updateSessionInState(updatedSession);
      } else {
        await loadSessions(currentUser);
      }
    } catch (err) {
      console.error('Failed to schedule session:', err);
      setError(err.message || 'Failed to schedule session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkComplete = async (sessionId) => {
    try {
      setActionLoading(true);
      setError('');

      const response = await fetchWithAuth(`${API_URL}/sessions/${sessionId}/complete`, {
        method: 'PATCH'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete session');
      }

      const updatedSession = data?.data?.session;
      if (updatedSession) {
        updateSessionInState(updatedSession);
      } else {
        await loadSessions(currentUser);
      }
    } catch (err) {
      console.error('Failed to complete session:', err);
      setError(err.message || 'Failed to complete session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSession = async (sessionId) => {
    const confirmed = window.confirm('Are you sure you want to cancel this session?');
    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError('');

      const response = await fetchWithAuth(`${API_URL}/sessions/${sessionId}/cancel`, {
        method: 'PATCH'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel session');
      }

      const updatedSession = data?.data?.session;
      if (updatedSession) {
        updateSessionInState(updatedSession);
      } else {
        await loadSessions(currentUser);
      }
    } catch (err) {
      console.error('Failed to cancel session:', err);
      setError(err.message || 'Failed to cancel session');
    } finally {
      setActionLoading(false);
    }
  };

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
                <h2>Your sessions</h2>
                <p>Manage your upcoming and completed skill swap sessions.</p>
              </div>
            </div>

            {error && (
              <div className="glass-panel onboarding-error-banner">
                {error}
              </div>
            )}

            {loading ? (
              <div className="glass-panel empty-requests-card">
                Loading sessions...
              </div>
            ) : sessions.length > 0 ? (
              <div className="sessions-list">
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onJoinCall={handleJoinCall}
                    onStartSession={handleStartSession}
                    onMarkComplete={handleMarkComplete}
                    onCancelSession={handleCancelSession}
                    onScheduleSession={handleScheduleSession}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel empty-requests-card">
                <h3>No sessions yet</h3>
                <p>Accept a swap request to create a session.</p>
              </div>
            )}
          </main>
        </div>

        <MobileNav />
      </div>
    </>
  );
}
