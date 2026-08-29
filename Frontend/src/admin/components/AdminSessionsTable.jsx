// src/admin/components/AdminSessionsTable.jsx
import React from 'react';

export default function AdminSessionsTable({ sessions, title = "Session Logs", onResolveDispute }) {
  const defaultSessions = [
    { id: 'sess_101', displayId: '#SES-000101', teacher: 'Aarav Sharma', learner: 'Priya Verma', topic: 'React Hooks', status: 'Completed' },
    { id: 'sess_102', displayId: '#SES-000102', teacher: 'Rohan Gupta', learner: 'Sneha Patel', topic: 'Python Data Science', status: 'Disputed' }
  ];

  const list = sessions?.length ? sessions : defaultSessions;

  const getStatusClass = (status) => {
    if (status === 'Completed' || status === 'Confirmed') return 'pill-earned';
    if (status === 'Disputed' || status === 'Cancelled') return 'pill-spent';
    return 'pill-admin';
  };

  return (
    <div className="admin-table-card">
      <h3 className="table-header-title">{title}</h3>
      <table className="admin-data-table">
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Teacher</th>
            <th>Learner</th>
            <th>Topic / Skill</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => {
            const formattedId = s.displayId || `#SES-${(s.id || '').toString().slice(-6).toUpperCase()}`;
            return (
              <tr key={s.id}>
                <td>
                  <span className="user-id-badge" title={`Full Session ID: ${s.id}`}>
                    {formattedId}
                  </span>
                </td>
                <td><strong>{s.teacher}</strong></td>
                <td>{s.learner}</td>
                <td>{s.topic}</td>
                <td>
                  <span className={`pill ${getStatusClass(s.status)}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <div className="table-actions-row">
                    {s.status === 'Disputed' && onResolveDispute ? (
                      <button 
                        type="button" 
                        className="action-btn btn-danger-sm"
                        onClick={() => onResolveDispute(s.id)}
                      >
                        ⚖️ Resolve Dispute
                      </button>
                    ) : (
                      <button type="button" className="action-btn">View Details</button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
