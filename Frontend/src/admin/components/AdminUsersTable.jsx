// src/admin/components/AdminUsersTable.jsx
import React from 'react';

export default function AdminUsersTable({ users, title = "User List", showRole = true, showEmail = false }) {
  const defaultUsers = [
    { id: '1', name: 'User 1', handle: '@user1', email: 'user1@example.com', skill: 'React JS', role: 'Admin', status: 'Active' },
    { id: '2', name: 'User 2', handle: '@user2', email: 'user2@example.com', skill: 'Python', role: 'User', status: 'Active' },
    { id: '3', name: 'User 3', handle: '@user3', email: 'user3@example.com', skill: 'UI Design', role: 'User', status: 'Active' }
  ];

  const userList = users || defaultUsers;

  return (
    <div className="admin-table-card">
      <h3 className="table-header-title">{title}</h3>
      <table className="admin-data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            {showEmail ? <th>Email</th> : <th>Handle</th>}
            {!showEmail && <th>Skill</th>}
            {showRole && <th>Role</th>}
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td><strong>{u.name}</strong></td>
              {showEmail ? <td>{u.email}</td> : <td>{u.handle}</td>}
              {!showEmail && <td>{u.skill}</td>}
              {showRole && (
                <td>
                  <span className={`pill ${u.role === 'Admin' ? 'pill-admin' : 'pill-user'}`}>
                    {u.role || 'User'}
                  </span>
                </td>
              )}
              <td>
                <span className="pill pill-active">{u.status}</span>
              </td>
              <td>
                <button type="button" className="action-btn">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
