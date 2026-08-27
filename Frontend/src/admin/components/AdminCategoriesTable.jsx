// src/admin/components/AdminCategoriesTable.jsx
import React from 'react';

export default function AdminCategoriesTable({ categories, title = "Category List" }) {
  const defaultCategories = [
    { id: '1', name: 'Code and Data', count: 120, status: 'Active' },
    { id: '2', name: 'Design and UI', count: 80, status: 'Active' },
    { id: '3', name: 'Languages', count: 90, status: 'Active' }
  ];

  const list = categories || defaultCategories;

  return (
    <div className="admin-table-card">
      <h3 className="table-header-title">{title}</h3>
      <table className="admin-data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Category Name</th>
            <th>Total Skills</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td><strong>{cat.name}</strong></td>
              <td>{cat.count} Skills</td>
              <td>
                <span className="pill pill-active">{cat.status}</span>
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
