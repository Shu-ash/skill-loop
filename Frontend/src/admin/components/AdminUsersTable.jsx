// src/admin/components/AdminUsersTable.jsx
import React from 'react';
import SkillLoopLoader from '../../components/SkillLoopLoader';

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
      <div className="table-header-row">
        <h3 className="table-header-title">{title}</h3>
        <span className="admin-count-pill">
          {loading ? 'Loading...' : `${userList.length} ${userList.length === 1 ? 'member' : 'members'}`}
        </span>
      </div>

      {loading ? (
        <SkillLoopLoader
          title="Loading Registered Members"
          subtitle="Fetching member accounts, skill profiles & permissions from MongoDB..."
          badgeText="MongoDB Live Sync"
          variant="transparent"
        />
      ) : userList.length === 0 ? (
        <div className="admin-table-empty">
          <span className="admin-table-empty-icon">👥</span>
          <h4 className="admin-table-empty-title">No Members Found</h4>
          <p className="admin-table-empty-desc">Registered community members will appear here in real-time.</p>
        </div>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th className="nowrap-cell">User ID</th>
              <th>Name &amp; Handle</th>
              {showEmail && <th>Email</th>}
              {showRole && <th>Role</th>}
              <th>Credits</th>
              <th>Status</th>
              {showActions && <th className="nowrap-cell">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {userList.map((u) => {
              const formattedId = u.displayId || `#USR-${(u.id || u._id || '').toString().slice(-6).toUpperCase()}`;
              const isSuperAdmin = u.role?.toLowerCase().includes('super') || u.email === 'admin@skillloop.com' || u.name === 'Super Admin';

              return (
                <tr key={u.id || u._id}>
                  <td className="nowrap-cell">
                    <span className="user-id-badge" title={`Full MongoDB ObjectId: ${u.id || u._id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td className="nowrap-cell">
                    <strong>{u.name}</strong>
                    <div className="admin-user-handle">{u.handle || `@${(u.email || '').split('@')[0]}`}</div>
                  </td>
                  {showEmail && (
                    <td>
                      <div>{u.email}</div>
                    </td>
                  )}
                  {showRole && (
                    <td className="nowrap-cell">
                      <span className={`pill ${isSuperAdmin ? 'pill-admin' : u.role === 'Admin' || u.role === 'admin' ? 'pill-admin' : 'pill-user'}`}>
                        {isSuperAdmin ? 'Super Admin' : (u.role || 'User')}
                      </span>
                    </td>
                  )}
                  <td className="admin-user-credits">
                    🪙 {u.credits ?? 10}
                  </td>
                  <td>
                    <span className={`pill ${u.status === 'Active' || u.status === 'active' ? 'pill-earned' : 'pill-spent'}`}>
                      {u.status || 'Active'}
                    </span>
                  </td>
                  {showActions && (
                    <td className="nowrap-cell">
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
                          <span className="protected-root-badge">
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
