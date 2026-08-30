// src/admin/components/AdminCategoriesTable.jsx
import React from 'react';

export default function AdminCategoriesTable({ categories = [], title = "Category List", onDeleteCategory, onViewDetails, loading = false }) {
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
            Click <strong>"+ Add New Category"</strong> above to create your first skill category with custom emojis!
          </p>
        </div>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Category ID</th>
              <th>Category Name</th>
              <th>Total Members / Skills</th>
              <th>Status</th>
              <th style={{ whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((cat) => {
              const formattedId = cat.displayId || `#CAT-${(cat.id || cat._id || '').toString().slice(-6).toUpperCase()}`;
              return (
                <tr key={cat.id || cat._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="user-id-badge" title={`Full ID: ${cat.id || cat._id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>{cat.icon || '⚡'}</span>
                    <strong>{cat.name}</strong>
                  </td>
                  <td>{cat.count || cat.memberCount || 0} Members</td>
                  <td>
                    <span className="pill pill-active">{cat.status || 'Active'}</span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div className="table-actions-row">
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
