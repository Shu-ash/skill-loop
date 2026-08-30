// src/admin/components/AdminReportsTable.jsx
import React from 'react';

export default function AdminReportsTable({ reports = [], title = "Moderation Queue Reports", onResolveReport, onViewDetails, loading = false }) {
  const list = Array.isArray(reports) ? reports : [];

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
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🛡️</span>
          <h4 style={{ margin: '0 0 0.4rem 0', fontWeight: 700, color: 'var(--slate-800)' }}>No Moderation Reports</h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>The community is healthy. Any reported violations will appear here.</p>
        </div>
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
              const formattedId = r.displayId || `#REP-${(r.id || r._id || '').toString().slice(-6).toUpperCase()}`;
              return (
                <tr key={r.id || r._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="user-id-badge" title={`Full Report ID: ${r.id || r._id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{r.reporterName || 'User'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}><strong>{r.reportedName || 'Member'}</strong></td>
                  <td>{r.reason}</td>
                  <td>
                    <span className={`pill ${r.status === 'Resolved' || r.status === 'resolved' ? 'pill-earned' : 'pill-spent'}`}>
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
                      {onResolveReport && r.status !== 'Resolved' && r.status !== 'resolved' ? (
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
