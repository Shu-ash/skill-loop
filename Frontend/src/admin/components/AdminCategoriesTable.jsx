// src/admin/components/AdminCategoriesTable.jsx
import React from 'react';

export default function AdminCategoriesTable({ categories, title = "Category List", onDeleteCategory, onViewDetails, loading = false }) {
  const defaultCategories = [
    { id: '1', displayId: '#CAT-000001', name: 'Code & Data', count: 140, status: 'Active' },
    { id: '2', displayId: '#CAT-000002', name: 'Design & UI', count: 95, status: 'Active' },
    { id: '3', displayId: '#CAT-000003', name: 'Languages', count: 80, status: 'Active' },
    { id: '4', displayId: '#CAT-000004', name: 'AI & Data Science', count: 110, status: 'Active' },
    { id: '5', displayId: '#CAT-000005', name: 'Marketing & Growth', count: 65, status: 'Active' },
    { id: '6', displayId: '#CAT-000006', name: 'Music & Audio', count: 45, status: 'Active' }
  ];

  const list = (categories && categories.length > 0) ? categories : (!loading && categories !== undefined && categories.length === 0 ? [] : defaultCategories);

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
        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
          No matching categories found.
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
              const formattedId = cat.displayId || `#CAT-${(cat.id || '').toString().slice(-6).toUpperCase()}`;
              return (
                <tr key={cat.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="user-id-badge" title={`Full ID: ${cat.id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
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
