// src/admin/components/AdminSessionsTable.jsx
import React from 'react';
import SkillLoopLoader from '../../components/SkillLoopLoader';

export default function AdminSessionsTable({ sessions = [], title = "Session Logs", onResolveDispute, onViewDetails, loading = false }) {
  const list = Array.isArray(sessions) ? sessions : [];

  const getStatusClass = (status) => {
    if (status === 'Completed' || status === 'Confirmed' || status === 'completed') return 'pill-earned';
    if (status === 'Disputed' || status === 'Cancelled' || status === 'cancelled') return 'pill-spent';
    return 'pill-admin';
  };

  return (
    <div className="admin-table-card">
      <div className="table-header-row">
        <h3 className="table-header-title">{title}</h3>
        <span className="admin-count-pill">
          {loading ? 'Loading...' : `${list.length} ${list.length === 1 ? 'session' : 'sessions'}`}
        </span>
      </div>

      {loading ? (
        <SkillLoopLoader
          title="Loading Swap Sessions"
          subtitle="Fetching scheduled learning sessions & video call audit logs from MongoDB..."
          badgeText="MongoDB Live Sync"
          variant="transparent"
        />
      ) : list.length === 0 ? (
        <div className="admin-table-empty">
          <span className="admin-table-empty-icon">📅</span>
          <h4 className="admin-table-empty-title">No Scheduled Sessions Yet</h4>
          <p className="admin-table-empty-desc">Real learning sessions between community members will appear here in real-time.</p>
        </div>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th className="nowrap-cell">Session ID</th>
              <th>Teacher</th>
              <th>Learner</th>
              <th>Topic / Skill</th>
              <th>Duration</th>
              <th>Status</th>
              <th className="nowrap-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => {
              const formattedId = s.displayId || `#SES-${(s.id || s._id || '').toString().slice(-6).toUpperCase()}`;
              return (
                <tr key={s.id || s._id}>
                  <td className="nowrap-cell">
                    <span className="user-id-badge" title={`Full Session ID: ${s.id || s._id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td className="nowrap-cell"><strong>{s.teacher}</strong></td>
                  <td className="nowrap-cell">{s.learner}</td>
                  <td>{s.topic}</td>
                  <td className="nowrap-cell">
                    <span className="session-duration-badge">{s.duration || 45} mins</span>
                  </td>
                  <td>
                    <span className={`pill ${getStatusClass(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="nowrap-cell">
                    <div className="table-actions-row">
                      {onViewDetails && (
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => onViewDetails(s)}
                          title="View Session Audit Details"
                        >
                          Details
                        </button>
                      )}
                      {(s.status === 'Disputed' || s.status === 'disputed') && onResolveDispute && (
                        <button 
                          type="button" 
                          className="action-btn btn-danger-sm"
                          onClick={() => onResolveDispute(s)}
                          title="Resolve Member Dispute"
                        >
                          Resolve Dispute
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
