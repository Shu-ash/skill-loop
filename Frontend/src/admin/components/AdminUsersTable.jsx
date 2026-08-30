// src/admin/components/AdminUsersTable.jsx
import React from 'react';

export default function AdminUsersTable({ 
  users = [], 
  title = "User List", 
  showRole = true, 
  showEmail = true, 
  showActions = true, 
  onRoleToggle, 
  onStatusToggle,
  onViewDetails,
  loading = false
}) {
  const userList = Array.isArray(users) ? users : [];

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
        <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>👥</span>
          <h4 style={{ margin: '0 0 0.4rem 0', fontWeight: 700, color: 'var(--slate-800)' }}>No Members Found</h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Registered community members will appear here in real-time.</p>
        </div>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>User ID</th>
              <th>Name &amp; Handle</th>
              {showEmail && <th>Email</th>}
              {showRole && <th>Role</th>}
              <th>Credits</th>
              <th>Status</th>
              {showActions && <th style={{ whiteSpace: 'nowrap' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {userList.map((u) => {
              const formattedId = u.displayId || `#USR-${(u.id || u._id || '').toString().slice(-6).toUpperCase()}`;
              const isSuperAdmin = u.role?.toLowerCase().includes('super') || u.email === 'admin@skillloop.com' || u.name === 'Super Admin';

              return (
                <tr key={u.id || u._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="user-id-badge" title={`Full MongoDB ObjectId: ${u.id || u._id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <strong>{u.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{u.handle || `@${(u.email || '').split('@')[0]}`}</div>
                  </td>
                  {showEmail && (
                    <td>
                      <div>{u.email}</div>
                    </td>
                  )}
                  {showRole && (
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className={`pill ${isSuperAdmin ? 'pill-admin' : u.role === 'Admin' || u.role === 'admin' ? 'pill-admin' : 'pill-user'}`}>
                        {isSuperAdmin ? 'Super Admin' : (u.role || 'User')}
                      </span>
                    </td>
                  )}
                  <td style={{ fontWeight: 700, color: 'var(--violet-primary, #6c5ce7)' }}>
                    🪙 {u.credits ?? 10}
                  </td>
                  <td>
                    <span className={`pill ${u.status === 'Active' || u.status === 'active' ? 'pill-earned' : 'pill-spent'}`}>
                      {u.status || 'Active'}
                    </span>
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
                          <span className="text-subtle" style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--violet-primary, #6c5ce7)', whiteSpace: 'nowrap', padding: '0 0.5rem' }}>
                            Protected Root
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
                                {u.role === 'Admin' || u.role === 'admin' ? 'Make User' : 'Make Admin'}
                              </button>
                            )}
                            {onStatusToggle && (
                              <button 
                                type="button" 
                                className="action-btn btn-danger-sm" 
                                onClick={() => onStatusToggle(u)}
                                title="Toggle Active/Banned Status"
                              >
                                {u.status === 'Active' || u.status === 'active' ? 'Ban' : 'Activate'}
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
