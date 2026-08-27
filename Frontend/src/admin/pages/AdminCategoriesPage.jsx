// src/admin/pages/AdminCategoriesPage.jsx
import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminCategoriesTable from '../components/AdminCategoriesTable';
import '../admin.css';

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState('categories');

  const categories = [
    { id: '1', name: 'Code and Data', count: 120, status: 'Active' },
    { id: '2', name: 'Design and UI', count: 80, status: 'Active' },
    { id: '3', name: 'Languages', count: 90, status: 'Active' }
  ];

  return (
    <>
      <div className="liquid-bg">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
      </div>

      <div className="admin-page-container">
        <AdminNavbar />

        <div className="admin-layout">
          <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

          <main className="admin-main-content">
            <div className="page-header">
              <h2>Skill Categories</h2>
              <p>Manage skill categories and tags.</p>
            </div>

            <AdminCategoriesTable categories={categories} title="System Skill Categories" />
          </main>
        </div>
      </div>
    </>
  );
}
