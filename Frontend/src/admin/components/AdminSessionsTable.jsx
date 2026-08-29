// src/admin/components/AdminSessionsTable.jsx
import React from 'react';

export default function AdminSessionsTable({ sessions, title = "Session Logs", onResolveDispute, onViewDetails, loading = false }) {
  const defaultSessions = [
    { id: 'sess_101', displayId: '#SES-000101', teacher: 'Aarav Sharma', learner: 'Priya Verma', topic: 'React Components & State', status: 'Completed' },
    { id: 'sess_102', displayId: '#SES-000102', teacher: 'Priya Verma', learner: 'Aarav Sharma', topic: 'Figma Auto-Layout', status: 'Scheduled' },
    { id: 'sess_103', displayId: '#SES-000103', teacher: 'Rohan Gupta', learner: 'Ananya Iyer', topic: 'MongoDB Indexing', status: 'Disputed' }
  ];

  const list = (sessions && sessions.length > 0) ? sessions : (!loading && sessions !== undefined && sessions.length === 0 ? [] : defaultSessions);

  const getStatusClass = (status) => {
    if (status === 'Completed' || status === 'Confirmed') return 'pill-earned';
    if (status === 'Disputed' || status === 'Cancelled') return 'pill-spent';
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
        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
          No matching sessions found.
        </div>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Session ID</th>
              <th>Teacher</th>
              <th>Learner</th>
              <th>Topic / Skill</th>
              <th>Status</th>
              <th style={{ whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => {
              const formattedId = s.displayId || `#SES-${(s.id || '').toString().slice(-6).toUpperCase()}`;
              return (
                <tr key={s.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="user-id-badge" title={`Full Session ID: ${s.id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}><strong>{s.teacher}</strong></td>
                  <td style={{ whiteSpace: 'nowrap' }}>{s.learner}</td>
                  <td>{s.topic}</td>
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
                      {s.status === 'Disputed' && onResolveDispute && (
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
