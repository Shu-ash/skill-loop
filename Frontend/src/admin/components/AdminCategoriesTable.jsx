// src/admin/components/AdminCategoriesTable.jsx
import React from 'react';

export default function AdminCategoriesTable({ 
  categories = [], 
  title = "Category List", 
  onManageSkills,
  onQuickAddSkill,
  onEditCategory,
  onDeleteCategory, 
  onViewDetails, 
  loading = false 
}) {
  const list = Array.isArray(categories) ? categories : [];

  return (
    <div className="admin-table-card">
      <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="table-header-title" style={{ margin: 0 }}>{title}</h3>
        <span className="admin-count-pill" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem', borderRadius: '12px', background: 'rgba(108, 92, 231, 0.1)', color: 'var(--violet-primary, #6c5ce7)', fontWeight: 600 }}>
          {loading ? 'Loading...' : `${list.length} ${list.length === 1 ? 'category' : 'categories'}`}
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
          Loading skill categories from MongoDB...
        </div>
      ) : list.length === 0 ? (
        <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🏷️</span>
          <h4 style={{ margin: '0 0 0.4rem 0', fontWeight: 700, color: 'var(--slate-800)' }}>No Categories in Database</h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Click <strong>"+ Add New Category"</strong> above to create your first skill category with custom skills and emojis!
          </p>
        </div>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Category ID</th>
              <th>Category Name</th>
              <th>Skills Count &amp; Tags</th>
              <th>Members</th>
              <th>Status</th>
              <th style={{ whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((cat) => {
              const formattedId = cat.displayId || `#CAT-${(cat.id || cat._id || '').toString().slice(-6).toUpperCase()}`;
              const skillsList = Array.isArray(cat.skills) ? cat.skills : [];

              return (
                <tr key={cat.id || cat._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="user-id-badge" title={`Full ID: ${cat.id || cat._id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>{cat.icon || '⚡'}</span>
                    <strong>{cat.name}</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span 
                          className="pill pill-violet" 
                          style={{ fontSize: '0.76rem', padding: '0.2rem 0.55rem', fontWeight: 700, cursor: 'pointer' }}
                          onClick={() => onManageSkills && onManageSkills(cat)}
                          title="Click to manage skills in this category"
                        >
                          ✨ {skillsList.length} {skillsList.length === 1 ? 'Skill' : 'Skills'}
                        </span>

                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => onQuickAddSkill && onQuickAddSkill(cat)}
                          title={`Add new skill to ${cat.name}`}
                          style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' }}
                        >
                          + Add Skill
                        </button>
                      </div>

                      {skillsList.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '340px' }}>
                          {skillsList.slice(0, 3).map((skill, idx) => (
                            <span 
                              key={idx} 
                              style={{ 
                                background: 'rgba(241, 245, 249, 0.9)', 
                                color: 'var(--slate-700, #334155)', 
                                fontSize: '0.72rem', 
                                fontWeight: 600, 
                                padding: '0.15rem 0.45rem', 
                                borderRadius: '6px',
                                border: '1px solid rgba(226, 232, 240, 0.9)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                          {skillsList.length > 3 && (
                            <span 
                              style={{ fontSize: '0.72rem', color: 'var(--violet-primary, #6c5ce7)', alignSelf: 'center', fontWeight: 600, cursor: 'pointer' }}
                              onClick={() => onManageSkills && onManageSkills(cat)}
                              title="Click to view all skills"
                            >
                              +{skillsList.length - 3} more →
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-subtle" style={{ fontSize: '0.74rem', fontStyle: 'italic' }}>
                          No skills added yet
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{cat.count || cat.memberCount || 0} Members</td>
                  <td>
                    <span className="pill pill-active">{cat.status || 'Active'}</span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div className="table-actions-row">
                      {onManageSkills && (
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => onManageSkills(cat)}
                          title="Manage Skills in this Category"
                          style={{ background: 'rgba(108, 92, 231, 0.1)', color: 'var(--violet-primary, #6c5ce7)', fontWeight: 600 }}
                        >
                          🎯 Skills ({skillsList.length})
                        </button>
                      )}
                      {onEditCategory && (
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => onEditCategory(cat)}
                          title="Edit Category Info & Icon"
                        >
                          ✏️ Edit
                        </button>
                      )}
                      {onViewDetails && (
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => onViewDetails(cat)}
                          title="View Category Details"
                        >
                          Details
                        </button>
                      )}
                      {onDeleteCategory && (
                        <button 
                          type="button" 
                          className="action-btn btn-danger-sm" 
                          onClick={() => onDeleteCategory(cat)}
                          title="Delete Skill Category"
                        >
                          Delete
                        </button>
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
