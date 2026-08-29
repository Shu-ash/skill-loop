// src/admin/components/AdminReportsTable.jsx
import React from 'react';

export default function AdminReportsTable({ reports, title = "Moderation Queue Reports", onResolveReport, onViewDetails, loading = false }) {
  const defaultReports = [
    { id: 'rep_1', displayId: '#REP-000001', reporterName: 'Sneha Patel', reportedName: 'Vikram Malhotra', reason: 'Sent unsolicited marketing spam links during introduction', status: 'Pending' }
  ];

  const list = (reports && reports.length > 0) ? reports : (!loading && reports !== undefined && reports.length === 0 ? [] : defaultReports);

  return (
    <div className="admin-table-card">
      <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="table-header-title" style={{ margin: 0 }}>{title}</h3>
        <span className="admin-count-pill" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem', borderRadius: '12px', background: 'rgba(108, 92, 231, 0.1)', color: 'var(--violet-primary, #6c5ce7)', fontWeight: 600 }}>
          {loading ? 'Loading...' : `${list.length} ${list.length === 1 ? 'report' : 'reports'}`}
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
          Loading moderation queue from MongoDB...
        </div>
      ) : list.length === 0 ? (
        <p className="empty-reports-msg" style={{ padding: '1rem', color: 'var(--slate-500)' }}>
          No active reports found in moderation queue. System is healthy!
        </p>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Report ID</th>
              <th>Reported By</th>
              <th>Reported User</th>
              <th>Reason</th>
              <th>Status</th>
              <th style={{ whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const formattedId = r.displayId || `#REP-${(r.id || '').toString().slice(-6).toUpperCase()}`;
              return (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="user-id-badge" title={`Full Report ID: ${r.id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{r.reporterName || 'User'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}><strong>{r.reportedName || 'Member'}</strong></td>
                  <td>{r.reason}</td>
                  <td>
                    <span className={`pill ${r.status === 'Resolved' ? 'pill-earned' : 'pill-spent'}`}>
                      {r.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div className="table-actions-row">
                      {onViewDetails && (
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => onViewDetails(r)}
                          title="View Report Details"
                        >
                          Details
                        </button>
                      )}
                      {onResolveReport && r.status !== 'Resolved' ? (
                        <>
                          <button 
                            type="button" 
                            className="action-btn"
                            onClick={() => onResolveReport(r, 'resolved')}
                            title="Resolve Violation"
                          >
                            Resolve
                          </button>
                          <button 
                            type="button" 
                            className="action-btn btn-danger-sm"
                            onClick={() => onResolveReport(r, 'dismissed')}
                            title="Dismiss Report"
                          >
                            Dismiss
                          </button>
                        </>
                      ) : (
                        <span className="text-subtle" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Resolved</span>
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
