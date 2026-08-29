// src/admin/components/AdminCategoriesTable.jsx
import React from 'react';

export default function AdminCategoriesTable({ categories, title = "Category List", onDeleteCategory }) {
  const defaultCategories = [
    { id: '1', displayId: '#CAT-000001', name: 'Code & Data', icon: '💻', count: 120, status: 'Active' },
    { id: '2', displayId: '#CAT-000002', name: 'Design & UI', icon: '🎨', count: 80, status: 'Active' },
    { id: '3', displayId: '#CAT-000003', name: 'Languages', icon: '🗣️', count: 90, status: 'Active' }
  ];

  const list = categories?.length ? categories : defaultCategories;

  return (
    <div className="admin-table-card">
      <h3 className="table-header-title">{title}</h3>
      <table className="admin-data-table">
        <thead>
          <tr>
            <th>Category ID</th>
            <th>Category Name</th>
            <th>Total Members / Skills</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((cat) => {
            const formattedId = cat.displayId || `#CAT-${(cat.id || '').toString().slice(-6).toUpperCase()}`;
            return (
              <tr key={cat.id}>
                <td>
                  <span className="user-id-badge" title={`Full ID: ${cat.id}`}>
                    {formattedId}
                  </span>
                </td>
                <td>
                  <strong>{cat.icon || '⚡'} {cat.name}</strong>
                </td>
                <td>{cat.count || 0} Members</td>
                <td>
                  <span className="pill pill-active">{cat.status || 'Active'}</span>
                </td>
                <td>
                  <div className="table-actions-row">
                    {onDeleteCategory && (
                      <button 
                        type="button" 
                        className="action-btn btn-danger-sm"
                        onClick={() => onDeleteCategory(cat.id, cat.name)}
                        title="Delete Skill Category"
                      >
                        🗑️ Delete
                      </button>
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
