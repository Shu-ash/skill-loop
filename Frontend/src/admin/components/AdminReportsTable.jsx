// src/admin/components/AdminReportsTable.jsx
import React from 'react';

export default function AdminReportsTable({ reports, title = "Pending Reports" }) {
  const defaultReports = [];
  const list = reports || defaultReports;

  return (
    <div className="admin-table-card">
      <h3 className="table-header-title">{title}</h3>
      {list.length === 0 ? (
        <p className="empty-reports-msg">
          ✓ No active reports found in moderation queue.
        </p>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Reported By</th>
              <th>Target</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.reportedBy}</td>
                <td>{r.target}</td>
                <td>{r.reason}</td>
                <td>
                  <span className={`pill ${r.status === 'Resolved' ? 'pill-earned' : 'pill-spent'}`}>{r.status}</span>
                </td>
                <td>
                  <button type="button" className="action-btn">Resolve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
