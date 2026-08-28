// src/admin/components/AdminSessionsTable.jsx
import React from 'react';

export default function AdminSessionsTable({ sessions, title = "Session Logs" }) {
  const defaultSessions = [
    { id: 'sess_101', teacher: 'User 1', learner: 'User 2', topic: 'React Basics', status: 'Completed' },
    { id: 'sess_102', teacher: 'User 2', learner: 'User 3', topic: 'Python Intro', status: 'Disputed' }
  ];

  const list = sessions || defaultSessions;

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
            <th>Topic</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.teacher}</td>
              <td>{s.learner}</td>
              <td>{s.topic}</td>
              <td>
                <span className={`pill ${getStatusClass(s.status)}`}>
                  {s.status}
                </span>
              </td>
              <td>
                <button type="button" className="action-btn">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
