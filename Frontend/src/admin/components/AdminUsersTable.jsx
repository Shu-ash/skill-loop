// src/admin/components/AdminUsersTable.jsx
import React from 'react';

export default function AdminUsersTable({ users, title = "User List", showRole = true, showEmail = false, onRoleToggle, onStatusToggle }) {
  const defaultUsers = [
    { id: '1', displayId: '#USR-000001', name: 'Super Admin', handle: '@admin', email: 'admin@skillloop.com', skill: 'Platform', role: 'Super Admin', status: 'Active' },
    { id: '2', displayId: '#USR-000002', name: 'Aarav Sharma', handle: '@aarav_dev', email: 'aarav@gmail.com', skill: 'React JS', role: 'User', status: 'Active' },
    { id: '3', displayId: '#USR-000003', name: 'Priya Verma', handle: '@priya_design', email: 'priya@gmail.com', skill: 'UI Design', role: 'User', status: 'Active' }
  ];

  const userList = users?.length ? users : defaultUsers;

  return (
    <div className="admin-table-card">
      <h3 className="table-header-title">{title}</h3>
      <table className="admin-data-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            {showEmail ? <th>Email</th> : <th>Handle</th>}
            {!showEmail && <th>Skill</th>}
            {showRole && <th>Role</th>}
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((u) => {
            const formattedId = u.displayId || `#USR-${(u.id || '').toString().slice(-6).toUpperCase()}`;
            const isSuperAdmin = u.role?.toLowerCase().includes('super') || u.email === 'admin@skillloop.com' || u.name === 'Super Admin';

            return (
              <tr key={u.id}>
                <td>
                  <span className="user-id-badge" title={`Full MongoDB ObjectId: ${u.id}`}>
                    {formattedId}
                  </span>
                </td>
                <td><strong>{u.name}</strong></td>
                {showEmail ? <td>{u.email}</td> : <td>{u.handle}</td>}
                {!showEmail && <td>{u.skill}</td>}
                {showRole && (
                  <td>
                    <span className={`pill ${isSuperAdmin ? 'pill-admin' : u.role === 'Admin' ? 'pill-admin' : 'pill-user'}`}>
                      {isSuperAdmin ? '👑 Super Admin' : (u.role || 'User')}
                    </span>
                  </td>
                )}
                <td>
                  <span className={`pill ${u.status === 'Active' ? 'pill-earned' : 'pill-spent'}`}>{u.status}</span>
                </td>
                <td>
                  <div className="table-actions-row">
                    {isSuperAdmin ? (
                      <span className="text-subtle" style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--violet-primary, #6c5ce7)' }}>
                        🔒 Root Super Admin
                      </span>
                    ) : (
                      <>
                        {onRoleToggle && (
                          <button 
                            type="button" 
                            className="action-btn"
                            onClick={() => onRoleToggle(u.id, u.role)}
                            title="Toggle Admin/User Role"
                          >
                            {u.role === 'Admin' ? 'Make User' : 'Make Admin'}
                          </button>
                        )}
                        {onStatusToggle && (
                          <button 
                            type="button" 
                            className="action-btn btn-danger-sm"
                            onClick={() => onStatusToggle(u.id, u.status)}
                            title="Toggle Active/Banned Status"
                          >
                            {u.status === 'Active' ? 'Ban' : 'Activate'}
                          </button>
                        )}
                      </>
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
