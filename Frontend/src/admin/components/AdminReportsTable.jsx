// src/admin/components/AdminReportsTable.jsx
import React from 'react';

export default function AdminReportsTable({ reports, title = "Moderation Queue Reports", onResolveReport }) {
  const defaultReports = [
    { id: 'rep_1', displayId: '#REP-000001', reporterName: 'Aarav Sharma', reportedName: 'Spam Account', reason: 'Inappropriate message', status: 'Pending' }
  ];

  const list = reports?.length ? reports : defaultReports;

  return (
    <div className="admin-table-card">
      <h3 className="table-header-title">{title}</h3>
      {list.length === 0 ? (
        <p className="empty-reports-msg" style={{ padding: '1rem', color: 'var(--slate-500)' }}>
          ✓ No active reports found in moderation queue. System is healthy!
        </p>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Reported By</th>
              <th>Reported User</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const formattedId = r.displayId || `#REP-${(r.id || '').toString().slice(-6).toUpperCase()}`;
              return (
                <tr key={r.id}>
                  <td>
                    <span className="user-id-badge" title={`Full Report ID: ${r.id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td>{r.reporterName || 'User'}</td>
                  <td><strong>{r.reportedName || 'Member'}</strong></td>
                  <td>{r.reason}</td>
                  <td>
                    <span className={`pill ${r.status === 'Resolved' ? 'pill-earned' : 'pill-spent'}`}>
                      {r.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions-row">
                      {onResolveReport && r.status !== 'Resolved' ? (
                        <>
                          <button 
                            type="button" 
                            className="action-btn"
                            onClick={() => onResolveReport(r.id, 'resolved')}
                          >
                            ✓ Resolve
                          </button>
                          <button 
                            type="button" 
                            className="action-btn btn-danger-sm"
                            onClick={() => onResolveReport(r.id, 'dismissed')}
                          >
                            Dismiss
                          </button>
                        </>
                      ) : (
                        <span className="text-subtle">Closed</span>
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
