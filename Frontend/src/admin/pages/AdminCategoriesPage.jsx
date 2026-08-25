// src/admin/pages/AdminCategoriesPage.jsx
import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import '../admin.css';

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState('categories');

  // Simple static category list
  const categories = [
    { id: '1', name: 'Code and Data', count: 120, status: 'Active' },
    { id: '2', name: 'Design and UI', count: 80, status: 'Active' },
    { id: '3', name: 'Languages', count: 90, status: 'Active' }
  ];

  return (
    <div className="admin-page-container">
      {/* Top Navbar */}
      <AdminNavbar />

      <div className="admin-layout">
        {/* Simple Fixed Sidebar */}
        <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Main Categories Content */}
        <main className="admin-main-content">
          <div className="page-header">
            <h2>Skill Categories</h2>
            <p>Manage skill categories and tags.</p>
          </div>

          {/* Categories Table */}
          <div className="admin-table-card">
            <h3 className="table-header-title">Category List</h3>
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
                {categories.map((cat) => (
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
        </main>
      </div>
    </div>
  );
}
