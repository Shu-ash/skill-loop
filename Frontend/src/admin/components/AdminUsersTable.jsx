// src/admin/components/AdminUsersTable.jsx
import React from 'react';

export default function AdminUsersTable({ 
  users, 
  title = "User List", 
  showRole = true, 
  showEmail = false, 
  showActions = true, 
  onRoleToggle, 
  onStatusToggle,
  onViewDetails,
  loading = false
}) {
  const defaultUsers = [
    { id: '1', displayId: '#USR-000001', name: 'Super Admin', handle: '@admin', email: 'admin@skillloop.com', skill: 'Platform', role: 'Super Admin', status: 'Active' },
    { id: '2', displayId: '#USR-000002', name: 'Aarav Sharma', handle: '@aarav_dev', email: 'aarav@gmail.com', skill: 'React JS', role: 'User', status: 'Active' },
    { id: '3', displayId: '#USR-000003', name: 'Priya Verma', handle: '@priya_design', email: 'priya@gmail.com', skill: 'UI Design', role: 'User', status: 'Active' }
  ];

  const userList = (users && users.length > 0) ? users : (!loading && users !== undefined && users.length === 0 ? [] : defaultUsers);

  return (
    <div className="admin-table-card">
      <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="table-header-title" style={{ margin: 0 }}>{title}</h3>
        <span className="admin-count-pill" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem', borderRadius: '12px', background: 'rgba(108, 92, 231, 0.1)', color: 'var(--violet-primary, #6c5ce7)', fontWeight: 600 }}>
          {loading ? 'Loading...' : `${userList.length} ${userList.length === 1 ? 'member' : 'members'}`}
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
          Loading live members from MongoDB database...
        </div>
      ) : userList.length === 0 ? (
        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
          No matching members found.
        </div>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>User ID</th>
              <th>Name</th>
              {showEmail ? <th>Email</th> : <th>Handle</th>}
              {!showEmail && <th>Skill</th>}
              {showRole && <th>Role</th>}
              <th>Status</th>
              {showActions && <th style={{ whiteSpace: 'nowrap' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {userList.map((u) => {
              const formattedId = u.displayId || `#USR-${(u.id || '').toString().slice(-6).toUpperCase()}`;
              const isSuperAdmin = u.role?.toLowerCase().includes('super') || u.email === 'admin@skillloop.com' || u.name === 'Super Admin';

              return (
                <tr key={u.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="user-id-badge" title={`Full MongoDB ObjectId: ${u.id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}><strong>{u.name}</strong></td>
                  {showEmail ? <td>{u.email}</td> : <td>{u.handle}</td>}
                  {!showEmail && <td>{u.skill}</td>}
                  {showRole && (
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className={`pill ${isSuperAdmin ? 'pill-admin' : u.role === 'Admin' ? 'pill-admin' : 'pill-user'}`}>
                        {isSuperAdmin ? 'Super Admin' : (u.role || 'User')}
                      </span>
                    </td>
                  )}
                  <td>
                    <span className={`pill ${u.status === 'Active' ? 'pill-earned' : 'pill-spent'}`}>{u.status}</span>
                  </td>
                  {showActions && (
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div className="table-actions-row">
                        {onViewDetails && (
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => onViewDetails(u)}
                            title="View Full Profile Details"
                          >
                            Details
                          </button>
                        )}

                        {isSuperAdmin ? (
                          <span className="text-subtle" style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--violet-primary, #6c5ce7)', whiteSpace: 'nowrap' }}>
                            Root Admin
                          </span>
                        ) : (
                          <>
                            {onRoleToggle && (
                              <button 
                                type="button" 
                                className="action-btn"
                                onClick={() => onRoleToggle(u)}
                                title="Toggle Admin/User Role"
                              >
                                {u.role === 'Admin' ? 'Make User' : 'Make Admin'}
                              </button>
                            )}
                            {onStatusToggle && (
                              <button 
                                type="button" 
                                className="action-btn btn-danger-sm"
                                onClick={() => onStatusToggle(u)}
                                title="Toggle Active/Banned Status"
                              >
                                {u.status === 'Active' ? 'Ban' : 'Activate'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
