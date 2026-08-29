// src/pages/SessionsPage.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import SessionCard from '../components/SessionCard';

// Sample scheduled session data
const MOCK_SESSION = {
  id: 'sess_101',
  title: 'Frontend Development Mentorship',
  partnerName: 'Sujit Bauna',
  partnerAvatar: 'SB',
  date: 'Today',
  time: '11:00 AM',
  mode: 'Online Video Call',
  meetLink: 'meet.google.com/',
  status: 'in_progress'
};

const ALLOWED_DURATIONS = [30, 45, 60, 90, 120];

export default function SessionsPage() {
  const [session, setSession] = useState(MOCK_SESSION);
  const [currentStep, setCurrentStep] = useState(3); // 3 = Call in Progress

<<<<<<< HEAD
  const handleJoinCall = (link) => {
    window.open(`https://${link}`, '_blank');
  };

  const handleMarkComplete = (sessId) => {
    setCurrentStep(4);
    alert('Session marked as complete! +1 Skill Credit awarded.');
  };

=======
  // =====================================================
  // STATE
  // =====================================================

  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState('');

  const [currentUser, setCurrentUser] =
    useState(null);

  const [showReviewModal, setShowReviewModal] =
    useState(false);

  const [reviewSession, setReviewSession] =
    useState(null);

  const [reviewSubmitted, setReviewSubmitted] =
    useState(false);

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  const getCurrentUser = () => {
    try {
      const storedUser =
        localStorage.getItem('user');

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (err) {
      console.error(
        'Failed to parse user:',
        err
      );

      return null;
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return 'Not scheduled';
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return 'Not scheduled';
    }

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    );
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (date) => {
    if (!date) {
      return 'Not scheduled';
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return 'Not scheduled';
    }

    return parsedDate.toLocaleTimeString(
      'en-IN',
      {
        hour: 'numeric',
        minute: '2-digit'
      }
    );
  };

  // =====================================================
  // FORMAT SESSION
  // =====================================================

  const formatSession = (
    backendSession,
    user
  ) => {
    if (!backendSession) {
      return null;
    }

    const teacher =
      backendSession.teacher || {};

    const learner =
      backendSession.learner || {};

    const userId =
      user?._id ||
      user?.id ||
      user?.userId;

    const teacherId =
      teacher?._id ||
      teacher?.id;

    const learnerId =
      learner?._id ||
      learner?.id;

    const isTeacher =
      Boolean(
        userId &&
        teacherId &&
        String(userId) ===
        String(teacherId)
      );

    const isLearner =
      Boolean(
        userId &&
        learnerId &&
        String(userId) ===
        String(learnerId)
      );

    const partner =
      isTeacher
        ? learner
        : teacher;

    const partnerName =
      partner?.name ||
      partner?.username ||
      `${partner?.firstName || ''} ${partner?.lastName || ''
        }`.trim() ||
      'Skill Loop User';

    const partnerAvatar =
      partnerName
        .split(' ')
        .filter(Boolean)
        .map(
          (part) => part[0]
        )
        .join('')
        .slice(0, 2)
        .toUpperCase() ||
      'SL';

    return {
      id:
        backendSession._id ||
        backendSession.id,

      isTeacher,

      isLearner,

      scheduledAt:
        backendSession.scheduledAt ||
        null,

      title:
        `${backendSession.skill || 'Skill'} Session`,

      partnerName,

      partnerAvatar,

      date:
        formatDate(
          backendSession.scheduledAt
        ),

      time:
        formatTime(
          backendSession.scheduledAt
        ),

      mode:
        backendSession.mode ===
          'in_person'
          ? 'In Person'
          : 'Online Video Call',

      meetLink:
        backendSession.meetLink ||
        '',

      duration:
        Number(
          backendSession.duration
        ) || 45,

      status:
        backendSession.status,

      skill:
        backendSession.skill,

      message:
        backendSession.message ||
        ''
    };
  };

  // =====================================================
  // LOAD ALL SESSIONS
  // =====================================================

  const loadSessions = async (
    userOverride = currentUser
  ) => {
    const accessToken =
      localStorage.getItem(
        'accessToken'
      );

    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response =
        await fetch(
          `${API_URL}/sessions`,
          {
            method: 'GET',

            headers: {
              Authorization:
                `Bearer ${accessToken}`
            },

            credentials: 'include'
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Failed to load sessions'
        );
      }

      // IMPORTANT:
      // Keep ALL sessions.
      const backendSessions =
        data?.data?.sessions || [];

      const formattedSessions =
        backendSessions
          .map(
            (item) =>
              formatSession(
                item,
                userOverride
              )
          )
          .filter(Boolean);

      setSessions(
        formattedSessions
      );

    } catch (err) {
      console.error(
        'Failed to load sessions:',
        err
      );

      setError(
        err.message ||
        'Failed to load sessions'
      );

      setSessions([]);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const user =
      getCurrentUser();

    setCurrentUser(user);

    loadSessions(user);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================================
  // UPDATE ONE SESSION
  // =====================================================

  const updateSessionInState = (
    backendSession
  ) => {
    if (!backendSession) {
      return;
    }

    const formattedSession =
      formatSession(
        backendSession,
        currentUser
      );

    if (!formattedSession) {
      return;
    }

    setSessions(
      (previousSessions) =>
        previousSessions.map(
          (item) =>
            String(item.id) ===
              String(formattedSession.id)
              ? formattedSession
              : item
        )
    );
  };

  // =====================================================
  // JOIN CALL
  // =====================================================

  const handleJoinCall = (
    meetLink
  ) => {
    if (!meetLink) {
      setError(
        'Meeting link is not available.'
      );

      return;
    }

    const normalizedLink =
      meetLink.startsWith(
        'http://'
      ) ||
        meetLink.startsWith(
          'https://'
        )
        ? meetLink
        : `https://${meetLink}`;

    window.open(
      normalizedLink,
      '_blank',
      'noopener,noreferrer'
    );
  };

  // =====================================================
  // START SESSION
  // =====================================================

  const handleStartSession =
    async (
      sessionId
    ) => {
      const accessToken =
        localStorage.getItem(
          'accessToken'
        );

      if (!accessToken) {
        navigate('/login');
        return;
      }

      try {
        setActionLoading(true);
        setError('');

        const response =
          await fetch(
            `${API_URL}/sessions/${sessionId}/start`,
            {
              method: 'PATCH',

              headers: {
                Authorization:
                  `Bearer ${accessToken}`
              },

              credentials: 'include'
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            'Failed to start session'
          );
        }

        const updatedSession =
          data?.data?.session;

        if (updatedSession) {
          updateSessionInState(
            updatedSession
          );
        } else {
          await loadSessions(
            currentUser
          );
        }

      } catch (err) {
        console.error(
          'Failed to start session:',
          err
        );

        setError(
          err.message ||
          'Failed to start session'
        );

      } finally {
        setActionLoading(false);
      }
    };

  // =====================================================
  // SCHEDULE SESSION
  //
  // EXISTING SCHEDULING FLOW PRESERVED
  // =====================================================

  const handleScheduleSession =
    async (
      sessionId,
      scheduledAt,
      mode,
      meetLink,
      duration
    ) => {
      const accessToken =
        localStorage.getItem(
          'accessToken'
        );

      if (!accessToken) {
        navigate('/login');
        return;
      }

      const selectedDuration =
        Number(duration);

      if (
        !ALLOWED_DURATIONS.includes(
          selectedDuration
        )
      ) {
        setError(
          'Duration must be 30, 45, 60, 90, or 120 minutes.'
        );

        return;
      }

      if (!scheduledAt) {
        setError(
          'Please select a date and time.'
        );

        return;
      }

      if (
        mode === 'online' &&
        !meetLink?.trim()
      ) {
        setError(
          'Meeting link is required for online sessions.'
        );

        return;
      }

      try {
        setActionLoading(true);
        setError('');

        const response =
          await fetch(
            `${API_URL}/sessions/${sessionId}/schedule`,
            {
              method: 'PATCH',

              headers: {
                Authorization:
                  `Bearer ${accessToken}`,

                'Content-Type':
                  'application/json'
              },

              credentials: 'include',

              body: JSON.stringify({
                scheduledAt,

                mode,

                meetLink:
                  mode === 'online'
                    ? meetLink.trim()
                    : '',

                duration:
                  selectedDuration
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            'Failed to schedule session'
          );
        }

        const updatedSession =
          data?.data?.session;

        if (updatedSession) {
          updateSessionInState(
            updatedSession
          );
        } else {
          await loadSessions(
            currentUser
          );
        }

      } catch (err) {
        console.error(
          'Failed to schedule session:',
          err
        );

        setError(
          err.message ||
          'Failed to schedule session'
        );

      } finally {
        setActionLoading(false);
      }
    };

  // =====================================================
  // COMPLETE SESSION
  // =====================================================

  const handleMarkComplete =
    async (
      sessionId
    ) => {
      const accessToken =
        localStorage.getItem(
          'accessToken'
        );

      if (!accessToken) {
        navigate('/login');
        return;
      }

      try {
        setActionLoading(true);
        setError('');

        const response =
          await fetch(
            `${API_URL}/sessions/${sessionId}/complete`,
            {
              method: 'PATCH',

              headers: {
                Authorization:
                  `Bearer ${accessToken}`
              },

              credentials: 'include'
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            'Failed to complete session'
          );
        }

        const updatedSession =
          data?.data?.session;

        if (updatedSession) {
          const formattedSession =
            formatSession(
              updatedSession,
              currentUser
            );

          updateSessionInState(
            updatedSession
          );

          setReviewSession(
            formattedSession
          );

          setReviewSubmitted(
            false
          );
        } else {
          await loadSessions(
            currentUser
          );
        }

      } catch (err) {
        console.error(
          'Failed to complete session:',
          err
        );

        setError(
          err.message ||
          'Failed to complete session'
        );

      } finally {
        setActionLoading(false);
      }
    };

  // =====================================================
  // CANCEL SESSION
  // =====================================================

  const handleCancelSession =
    async (
      sessionId
    ) => {
      const confirmed =
        window.confirm(
          'Are you sure you want to cancel this session?'
        );

      if (!confirmed) {
        return;
      }

      const accessToken =
        localStorage.getItem(
          'accessToken'
        );

      if (!accessToken) {
        navigate('/login');
        return;
      }

      try {
        setActionLoading(true);
        setError('');

        const response =
          await fetch(
            `${API_URL}/sessions/${sessionId}/cancel`,
            {
              method: 'PATCH',

              headers: {
                Authorization:
                  `Bearer ${accessToken}`
              },

              credentials: 'include'
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            'Failed to cancel session'
          );
        }

        const updatedSession =
          data?.data?.session;

        if (updatedSession) {
          updateSessionInState(
            updatedSession
          );
        } else {
          await loadSessions(
            currentUser
          );
        }

      } catch (err) {
        console.error(
          'Failed to cancel session:',
          err
        );

        setError(
          err.message ||
          'Failed to cancel session'
        );

      } finally {
        setActionLoading(false);
      }
    };

  // =====================================================
  // OPEN REVIEW
  // =====================================================

  const handleOpenReview = (
    session
  ) => {
    setReviewSession(
      session
    );

    setReviewSubmitted(
      false
    );

    setShowReviewModal(
      true
    );
  };

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const handleReviewSubmit =
    async (
      reviewData
    ) => {
      const accessToken =
        localStorage.getItem(
          'accessToken'
        );

      if (!accessToken) {
        navigate('/login');
        return;
      }

      if (!reviewSession?.id) {
        setError(
          'Session ID is missing.'
        );

        return;
      }

      try {
        setActionLoading(true);
        setError('');

        const response =
          await fetch(
            `${API_URL}/reviews`,
            {
              method: 'POST',

              headers: {
                Authorization:
                  `Bearer ${accessToken}`,

                'Content-Type':
                  'application/json'
              },

              credentials: 'include',

              body: JSON.stringify({
                sessionId:
                  reviewSession.id,

                rating:
                  reviewData.rating,

                comment:
                  reviewData.comment
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            'Failed to submit review'
          );
        }

        setReviewSubmitted(
          true
        );

        setShowReviewModal(
          false
        );

      } catch (err) {
        console.error(
          'Failed to submit review:',
          err
        );

        setError(
          err.message ||
          'Failed to submit review'
        );

      } finally {
        setActionLoading(false);
      }
    };

  // =====================================================
  // RENDER
  // =====================================================

>>>>>>> 2fd2ba0 (fix: display all sessions without changing scheduling)
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
<<<<<<< HEAD
          <Sidebar user={{ name: 'Harsh Vishwakarma', credits: 3, avatar: 'HV' }} />

          <main className="main-content">
            <div className="page-title-row">
              <div>
                <h2>Active Session</h2>
                <p>Session with Sujit Bauna • Today, 11:00 AM</p>
              </div>
            </div>

            {/* Component 1: Progress Stepper */}
            <div className="glass-panel" style={{ padding: '1.5rem 1.8rem', borderRadius: '24px' }}>
              <SessionProgressStepper currentStep={currentStep} />
            </div>

            {/* Component 2: Session Main Card */}
            <SessionCard
              session={session}
              onJoinCall={handleJoinCall}
              onMarkComplete={handleMarkComplete}
            />
=======

          <Sidebar />

          <main className="main-content">

            <div className="page-title-row">
              <div>
                <h2>
                  Your sessions
                </h2>

                <p>
                  Manage your upcoming
                  and completed skill
                  swap sessions.
                </p>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="glass-panel"
                style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  color:
                    'var(--coral-primary)'
                }}
              >
                {error}
              </div>
            )}

            {/* LOADING */}

            {loading ? (

              <div
                className="glass-panel"
                style={{
                  padding: '2rem',
                  textAlign: 'center'
                }}
              >
                Loading sessions...
              </div>

            ) : sessions.length > 0 ? (

              /*
               * IMPORTANT:
               * Render EVERY session.
               */

              <div
                className="sessions-list"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >

                {sessions.map(
                  (session) => (
                    <React.Fragment
                      key={session.id}
                    >

                      <SessionCard
                        session={
                          session
                        }

                        onJoinCall={
                          handleJoinCall
                        }

                        onStartSession={
                          handleStartSession
                        }

                        onMarkComplete={
                          handleMarkComplete
                        }

                        onCancelSession={
                          handleCancelSession
                        }

                        onScheduleSession={
                          handleScheduleSession
                        }

                        actionLoading={
                          actionLoading
                        }
                      />

                      {/* REVIEW FOR COMPLETED SESSION */}

                      {session.status ===
                        'completed' && (
                          <div
                            className="glass-panel"
                            style={{
                              padding:
                                '1.25rem',
                              textAlign:
                                'center'
                            }}
                          >
                            <h3>
                              🎉 Session
                              completed!
                            </h3>

                            <p>
                              Share your
                              experience
                              with{' '}

                              <strong>
                                {
                                  session.partnerName
                                }
                              </strong>
                              .
                            </p>

                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() =>
                                handleOpenReview(
                                  session
                                )
                              }
                            >
                              ⭐ Leave a
                              Review
                            </button>
                          </div>
                        )}

                    </React.Fragment>
                  )
                )}

              </div>

            ) : (

              <div
                className="glass-panel"
                style={{
                  padding: '3rem',
                  textAlign: 'center'
                }}
              >
                <h3>
                  No sessions yet
                </h3>

                <p>
                  Accept a swap request
                  to create a session.
                </p>
              </div>

            )}

>>>>>>> 2fd2ba0 (fix: display all sessions without changing scheduling)
          </main>
        </div>

        <MobileNav />
      </div>

      {/* REVIEW MODAL */}

      {showReviewModal &&
        reviewSession && (
          <ReviewModal
            session={
              reviewSession
            }

            onSubmit={
              handleReviewSubmit
            }

            onClose={() => {
              setShowReviewModal(
                false
              );

              setReviewSession(
                null
              );
            }}

            loading={
              actionLoading
            }

            submitted={
              reviewSubmitted
            }
          />
        )}
    </>
  );
}
