<<<<<<< HEAD
// src/components/SessionCard.jsx
import React from 'react';

// SessionCard: Card component showing scheduled session details, meeting link, and actions
export default function SessionCard({ session, onJoinCall, onMarkComplete }) {
  const { title, partnerName, partnerAvatar, date, time, mode, meetLink, status } = session;
=======
import React, {
  useEffect,
  useState
} from 'react';

export default function SessionCard({
  session,
  onJoinCall,
  onStartSession,
  onMarkComplete,
  onCancelSession,
  onScheduleSession,
  actionLoading
}) {
  // =========================================================
  // SAFETY
  // =========================================================

  if (!session) {
    return null;
  }

  // =========================================================
  // SESSION DATA
  // =========================================================

  const {
    title,
    partnerName,
    partnerAvatar,
    date,
    time,
    mode,
    meetLink,
    status,
    id,
    isTeacher,
    scheduledAt,
    duration
  } = session;

  // =========================================================
  // SCHEDULE FORM STATE
  // =========================================================

  const [
    scheduledAtInput,
    setScheduledAtInput
  ] = useState('');

  const [
    sessionMode,
    setSessionMode
  ] = useState(
    mode === 'In Person'
      ? 'in_person'
      : 'online'
  );

  const [
    meetLinkInput,
    setMeetLinkInput
  ] = useState(
    meetLink || ''
  );

  const [
    selectedDuration,
    setSelectedDuration
  ] = useState(
    Number(duration) || 45
  );

  // =========================================================
  // UPDATE FORM WHEN SESSION CHANGES
  // =========================================================

  useEffect(() => {
    setSessionMode(
      mode === 'In Person'
        ? 'in_person'
        : 'online'
    );

    setMeetLinkInput(
      meetLink || ''
    );

    setSelectedDuration(
      Number(duration) || 45
    );

    // If session is already scheduled,
    // don't keep old scheduling input.
    if (
      scheduledAt &&
      status === 'scheduled'
    ) {
      setScheduledAtInput('');
    }
  }, [
    mode,
    meetLink,
    duration,
    scheduledAt,
    status
  ]);

  // =========================================================
  // CURRENT TIME
  // =========================================================

  const [currentTime, setCurrentTime] =
    useState(
      new Date()
    );

  useEffect(() => {
    const timer =
      setInterval(() => {
        setCurrentTime(
          new Date()
        );
      }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // =========================================================
  // SESSION START TIME
  // =========================================================

  const sessionStartTime =
    scheduledAt
      ? new Date(
        scheduledAt
      )
      : null;

  const validSessionStartTime =
    sessionStartTime &&
    !Number.isNaN(
      sessionStartTime.getTime()
    );

  // =========================================================
  // JOIN AVAILABILITY
  // =========================================================

  const canJoin =
    Boolean(meetLink) &&
    Boolean(
      validSessionStartTime
    ) &&
    currentTime >=
    sessionStartTime;

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = () => {
    switch (status) {
      case 'scheduled':
        return 'SCHEDULED';

      case 'in_progress':
        return 'IN PROGRESS';

      case 'completed':
        return 'COMPLETED';

      case 'cancelled':
        return 'CANCELLED';

      default:
        return (
          status?.toUpperCase() ||
          'UNKNOWN'
        );
    }
  };

  // =========================================================
  // MINIMUM DATETIME
  // =========================================================

  const getMinDateTime = () => {
    const now =
      new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        now.getDate()
      ).padStart(2, '0');

    const hours =
      String(
        now.getHours()
      ).padStart(2, '0');

    const minutes =
      String(
        now.getMinutes()
      ).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // =========================================================
  // HANDLE SCHEDULE
  // =========================================================

  const handleSchedule = () => {
    if (!onScheduleSession) {
      console.error(
        'onScheduleSession is not provided.'
      );

      return;
    }

    // -------------------------------------------------------
    // DATE
    // -------------------------------------------------------

    if (!scheduledAtInput) {
      alert(
        'Please select a date and time.'
      );

      return;
    }

    // -------------------------------------------------------
    // DATE VALIDATION
    // -------------------------------------------------------

    const selectedDate =
      new Date(
        scheduledAtInput
      );

    if (
      Number.isNaN(
        selectedDate.getTime()
      )
    ) {
      alert(
        'Please select a valid date and time.'
      );

      return;
    }

    if (
      selectedDate <= new Date()
    ) {
      alert(
        'Please select a future date and time.'
      );

      return;
    }

    // -------------------------------------------------------
    // DURATION
    // -------------------------------------------------------

    const finalDuration =
      Number(
        selectedDuration
      );

    const allowedDurations = [
      30,
      45,
      60,
      90,
      120
    ];

    if (
      !allowedDurations.includes(
        finalDuration
      )
    ) {
      alert(
        'Please select a valid duration.'
      );

      return;
    }

    // -------------------------------------------------------
    // MODE
    // -------------------------------------------------------

    if (
      sessionMode !==
      'online' &&
      sessionMode !==
      'in_person'
    ) {
      alert(
        'Please select a valid session mode.'
      );

      return;
    }

    // -------------------------------------------------------
    // MEET LINK
    // -------------------------------------------------------

    if (
      sessionMode ===
      'online' &&
      !meetLinkInput.trim()
    ) {
      alert(
        'Please enter the Google Meet link.'
      );

      return;
    }

    // -------------------------------------------------------
    // SEND TO PARENT
    // -------------------------------------------------------

    onScheduleSession(
      id,

      selectedDate.toISOString(),

      sessionMode,

      sessionMode ===
        'online'
        ? meetLinkInput.trim()
        : '',

      finalDuration
    );
  };
>>>>>>> 2fd2ba0 (fix: display all sessions without changing scheduling)

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="glass-panel session-card">
<<<<<<< HEAD
=======

      {/* =====================================================
          HEADER
      ====================================================== */}

>>>>>>> 2fd2ba0 (fix: display all sessions without changing scheduling)
      <div className="session-card-header">
        <div>
<<<<<<< HEAD
          <span className="pill-badge pill-violet">IN PROGRESS</span>
          <h3>{title}</h3>
          <p className="session-partner-sub">Session with {partnerName} • {date} at {time}</p>
=======

          <span className="pill-badge pill-violet">
            {getStatusLabel()}
          </span>

          <h3>
            {title}
          </h3>

          <p className="session-partner-sub">
            Session with{' '}
            {partnerName}

            {' • '}

            {date}

            {' at '}

            {time}
          </p>

>>>>>>> 2fd2ba0 (fix: display all sessions without changing scheduling)
        </div>
        <div className="partner-avatar-circle">{partnerAvatar}</div>
      </div>

<<<<<<< HEAD
      {/* Meeting Link Row */}
      <div className="session-meet-banner">
        <div className="meet-info">
          <span className="meet-icon">🎥</span>
          <div>
            <strong>Google Meet Link</strong>
            <p>{meetLink}</p>
          </div>
        </div>
        <button 
          type="button" 
          className="btn btn-primary"
          onClick={() => onJoinCall(meetLink)}
        >
          🎥 Join Google Meet →
        </button>
      </div>
=======

      {/* =====================================================
          SCHEDULE SESSION
          ONLY TEACHER
      ====================================================== */}

      {isTeacher &&
        status === 'scheduled' &&
        !scheduledAt &&
        !meetLink && (
          <div
            className="glass-panel"
            style={{
              padding:
                '1.25rem',
              marginTop:
                '1rem',
              marginBottom:
                '1rem'
            }}
          >

            <h4>
              📅 Schedule Session
            </h4>

            <p
              style={{
                marginBottom:
                  '1rem'
              }}
            >
              Choose when you want
              to conduct this
              session.
            </p>


            {/* =================================================
                DATE & TIME
            ================================================== */}

            <div className="form-group">

              <label htmlFor="scheduledAt">
                Date & Time
              </label>

              <input
                id="scheduledAt"
                type="datetime-local"
                value={
                  scheduledAtInput
                }
                min={
                  getMinDateTime()
                }
                onChange={(e) =>
                  setScheduledAtInput(
                    e.target.value
                  )
                }
                disabled={
                  actionLoading
                }
              />

            </div>


            {/* =================================================
                DURATION
            ================================================== */}

            <div className="form-group">

              <label htmlFor="sessionDuration">
                Duration
              </label>

              <select
                id="sessionDuration"
                value={
                  selectedDuration
                }
                onChange={(e) =>
                  setSelectedDuration(
                    Number(
                      e.target.value
                    )
                  )
                }
                disabled={
                  actionLoading
                }
              >

                <option value={30}>
                  30 minutes
                </option>

                <option value={45}>
                  45 minutes
                </option>

                <option value={60}>
                  60 minutes
                </option>

                <option value={90}>
                  90 minutes
                </option>

                <option value={120}>
                  120 minutes
                </option>

              </select>

            </div>


            {/* =================================================
                MODE
            ================================================== */}

            <div className="form-group">

              <label htmlFor="sessionMode">
                Session Mode
              </label>

              <select
                id="sessionMode"
                value={
                  sessionMode
                }
                onChange={(e) =>
                  setSessionMode(
                    e.target.value
                  )
                }
                disabled={
                  actionLoading
                }
              >

                <option value="online">
                  Online
                </option>

                <option value="in_person">
                  In Person
                </option>

              </select>

            </div>


            {/* =================================================
                GOOGLE MEET LINK
            ================================================== */}

            {sessionMode ===
              'online' && (
                <div className="form-group">

                  <label htmlFor="meetLink">
                    Google Meet Link
                  </label>

                  <input
                    id="meetLink"
                    type="url"
                    value={
                      meetLinkInput
                    }
                    onChange={(e) =>
                      setMeetLinkInput(
                        e.target.value
                      )
                    }
                    placeholder="https://meet.google.com/abc-defg-hij"
                    disabled={
                      actionLoading
                    }
                  />

                </div>
              )}


            {/* =================================================
                SCHEDULE BUTTON
            ================================================== */}

            <button
              type="button"
              className="btn btn-primary btn-full"
              onClick={
                handleSchedule
              }
              disabled={
                actionLoading ||
                !scheduledAtInput ||
                (
                  sessionMode ===
                  'online' &&
                  !meetLinkInput.trim()
                )
              }
            >
              {actionLoading
                ? 'Scheduling...'
                : '📅 Schedule Session'}
            </button>

          </div>
        )}


      {/* =====================================================
          SCHEDULED SESSION DETAILS
      ====================================================== */}

      {status ===
        'scheduled' &&
        scheduledAt && (
          <div
            className="glass-panel"
            style={{
              padding:
                '1rem',
              marginTop:
                '1rem',
              marginBottom:
                '1rem'
            }}
          >

            <strong>
              📅 Session scheduled
            </strong>

            <p
              style={{
                marginTop:
                  '0.4rem'
              }}
            >
              {date}
              {' • '}
              {time}
            </p>

          </div>
        )}


      {/* =====================================================
          MEETING LINK
      ====================================================== */}

      {meetLink && (
        <div className="session-meet-banner">

          <div className="meet-info">

            <span className="meet-icon">
              🎥
            </span>

            <div>

              <strong>
                Google Meet Link
              </strong>

              <p>
                {meetLink}
              </p>

            </div>

          </div>


          {/* JOIN BUTTON */}

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (canJoin) {
                onJoinCall(
                  meetLink
                );
              }
            }}
            disabled={
              actionLoading ||
              !canJoin
            }
          >

            {canJoin
              ? '🎥 Join Google Meet →'
              : `🔒 Available at ${time}`}

          </button>

        </div>
      )}


      {/* =====================================================
          SESSION DETAILS
      ====================================================== */}
>>>>>>> 2fd2ba0 (fix: display all sessions without changing scheduling)

      {/* Bottom Session Details */}
      <div className="session-meta-grid">
<<<<<<< HEAD
=======

        {/* MODE */}

>>>>>>> 2fd2ba0 (fix: display all sessions without changing scheduling)
        <div className="meta-item">
          <span>Mode</span>
          <strong>{mode}</strong>
        </div>
<<<<<<< HEAD
        <div className="meta-item">
          <span>Duration</span>
          <strong>45 mins</strong>
        </div>
=======


        {/* DURATION */}

        <div className="meta-item">

          <span>
            Duration
          </span>

          <strong>
            {Number(
              duration
            ) || 45}{' '}
            mins
          </strong>

        </div>


        {/* CREDIT */}

>>>>>>> 2fd2ba0 (fix: display all sessions without changing scheduling)
        <div className="meta-item">
          <span>Credit Reward</span>
          <strong style={{ color: 'var(--mint-primary)' }}>+1 Credit to {partnerName}</strong>
        </div>
      </div>

<<<<<<< HEAD
      <div className="session-card-actions">
        <button 
          type="button" 
          className="btn btn-secondary btn-full"
          onClick={() => onMarkComplete(session.id)}
          style={{ background: 'var(--mint-subtle)', color: 'var(--mint-primary)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
        >
          ✓ Mark session as completed
        </button>
=======

      {/* =====================================================
          ACTIONS
      ====================================================== */}

      <div className="session-card-actions">

        {/* ===================================================
            SCHEDULED
        ==================================================== */}

        {status ===
          'scheduled' && (
            <>

              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={() =>
                  onStartSession(
                    id
                  )
                }
                disabled={
                  actionLoading
                }
              >

                {actionLoading
                  ? 'Starting...'
                  : '▶ Start Session'}

              </button>


              <button
                type="button"
                className="btn btn-secondary btn-full"
                onClick={() =>
                  onCancelSession(
                    id
                  )
                }
                disabled={
                  actionLoading
                }
              >
                Cancel Session
              </button>

            </>
          )}


        {/* ===================================================
            IN PROGRESS
        ==================================================== */}

        {status ===
          'in_progress' && (

            <button
              type="button"
              className="btn btn-secondary btn-full"
              onClick={() =>
                onMarkComplete(
                  id
                )
              }
              disabled={
                actionLoading
              }
              style={{
                background:
                  'var(--mint-subtle)',

                color:
                  'var(--mint-primary)',

                borderColor:
                  'rgba(16, 185, 129, 0.3)'
              }}
            >

              {actionLoading
                ? 'Completing...'
                : '✓ Mark session as completed'}

            </button>
          )}


        {/* ===================================================
            COMPLETED
        ==================================================== */}

        {status ===
          'completed' && (

            <div
              className="glass-panel"
              style={{
                padding:
                  '1rem',
                textAlign:
                  'center'
              }}
            >
              ✓ Session completed
            </div>
          )}


        {/* ===================================================
            CANCELLED
        ==================================================== */}

        {status ===
          'cancelled' && (

            <div
              className="glass-panel"
              style={{
                padding:
                  '1rem',
                textAlign:
                  'center'
              }}
            >
              Session cancelled
            </div>
          )}

>>>>>>> 2fd2ba0 (fix: display all sessions without changing scheduling)
      </div>
    </div>
  );
}