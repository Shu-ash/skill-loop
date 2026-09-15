// src/admin/components/AdminReportsTable.jsx
import React from 'react';
import SkillLoopLoader from '../../components/SkillLoopLoader';

export default function AdminReportsTable({ reports = [], title = "Moderation Queue Reports", onResolveReport, onViewDetails, loading = false }) {
  const list = Array.isArray(reports) ? reports : [];

  return (
    <div className="admin-table-card">
      <div className="table-header-row">
        <h3 className="table-header-title">{title}</h3>
        <span className="admin-count-pill">
          {loading ? 'Loading...' : `${list.length} ${list.length === 1 ? 'report' : 'reports'}`}
        </span>
      </div>

      {loading ? (
        <SkillLoopLoader
          title="Loading Moderation Queue"
          subtitle="Connecting to moderation logs & violation flags in MongoDB..."
          badgeText="MongoDB Live Sync"
          variant="transparent"
        />
      ) : list.length === 0 ? (
        <div className="admin-table-empty">
          <span className="admin-table-empty-icon">🛡️</span>
          <h4 className="admin-table-empty-title">No Moderation Reports</h4>
          <p className="admin-table-empty-desc">The community is healthy. Any reported violations will appear here.</p>
        </div>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th className="nowrap-cell">Report ID</th>
              <th>Reported By</th>
              <th>Reported User</th>
              <th>Reason</th>
              <th>Status</th>
              <th className="nowrap-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const formattedId = r.displayId || `#REP-${(r.id || r._id || '').toString().slice(-6).toUpperCase()}`;
              return (
                <tr key={r.id || r._id}>
                  <td className="nowrap-cell">
                    <span className="user-id-badge" title={`Full Report ID: ${r.id || r._id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td className="nowrap-cell">{r.reporterName || 'User'}</td>
                  <td className="nowrap-cell"><strong>{r.reportedName || 'Member'}</strong></td>
                  <td>{r.reason}</td>
                  <td>
                    <span className={`pill ${r.status === 'Resolved' || r.status === 'resolved' ? 'pill-earned' : 'pill-spent'}`}>
                      {r.status || 'Pending'}
                    </span>
                  </td>
                  <td className="nowrap-cell">
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
                        <span className="text-subtle report-resolved-label">Resolved</span>
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
