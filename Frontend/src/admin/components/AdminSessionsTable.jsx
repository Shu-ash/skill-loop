// src/admin/components/AdminSessionsTable.jsx
import React from 'react';

export default function AdminSessionsTable({ sessions = [], title = "Session Logs", onResolveDispute, onViewDetails, loading = false }) {
  const list = Array.isArray(sessions) ? sessions : [];

  const getStatusClass = (status) => {
    if (status === 'Completed' || status === 'Confirmed' || status === 'completed') return 'pill-earned';
    if (status === 'Disputed' || status === 'Cancelled' || status === 'cancelled') return 'pill-spent';
    return 'pill-admin';
  };

  return (
    <div className="admin-table-card">
      <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="table-header-title" style={{ margin: 0 }}>{title}</h3>
        <span className="admin-count-pill" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem', borderRadius: '12px', background: 'rgba(108, 92, 231, 0.1)', color: 'var(--violet-primary, #6c5ce7)', fontWeight: 600 }}>
          {loading ? 'Loading...' : `${list.length} ${list.length === 1 ? 'session' : 'sessions'}`}
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
          Loading live sessions from MongoDB...
        </div>
      ) : list.length === 0 ? (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📅</span>
          <h4 style={{ margin: '0 0 0.4rem 0', fontWeight: 700, color: 'var(--slate-800)' }}>No Scheduled Sessions Yet</h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Real learning sessions between community members will appear here in real-time.</p>
        </div>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Session ID</th>
              <th>Teacher</th>
              <th>Learner</th>
              <th>Topic / Skill</th>
              <th>Duration</th>
              <th>Status</th>
              <th style={{ whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => {
              const formattedId = s.displayId || `#SES-${(s.id || s._id || '').toString().slice(-6).toUpperCase()}`;
              return (
                <tr key={s.id || s._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="user-id-badge" title={`Full Session ID: ${s.id || s._id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}><strong>{s.teacher}</strong></td>
                  <td style={{ whiteSpace: 'nowrap' }}>{s.learner}</td>
                  <td>{s.topic}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.duration || 45} mins</span>
                  </td>
                  <td>
                    <span className={`pill ${getStatusClass(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
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
