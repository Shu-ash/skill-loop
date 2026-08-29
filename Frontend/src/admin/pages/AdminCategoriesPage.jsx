// src/admin/pages/AdminCategoriesPage.jsx
import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminCategoriesTable from '../components/AdminCategoriesTable';
import '../admin.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('⚡');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'x-admin-token': 'admin2026'
        }
      });
      const data = await response.json();
      if (data.success && data.data?.categories) {
        setCategories(data.data.categories);
      }
    } catch (err) {
      console.error('Failed to load admin categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSubmitting(true);
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
          'x-admin-token': 'admin2026'
        },
        body: JSON.stringify({
          name: newCatName.trim(),
          icon: newCatIcon || '⚡',
          description: newCatDesc.trim()
        })
      });

      if (response.ok) {
        setNewCatName('');
        setNewCatDesc('');
        setShowAddModal(false);
        fetchCategories();
      }
    } catch (err) {
      console.error('Error creating category:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${catId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'x-admin-token': 'admin2026'
        }
      });

      if (response.ok) {
        setCategories(prev => prev.filter(c => c.id !== catId));
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

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
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2>Skill Categories</h2>
                <p>Manage skill categories and platform tags.</p>
              </div>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                + Add New Category
              </button>
            </div>

            <AdminCategoriesTable 
              categories={categories} 
              title="System Skill Categories" 
              onDeleteCategory={handleDeleteCategory}
            />
          </main>
        </div>
      </div>

      {/* Add New Category Glassmorphic Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="glass-panel logout-confirm-box clay-card-3d" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>⚡ Add New Category</h3>
              <button type="button" className="close-modal-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddCategory} className="edit-profile-form">
              <div className="form-group">
                <label>Category Icon Emoji</label>
                <input 
                  className="form-input" 
                  type="text" 
                  value={newCatIcon} 
                  onChange={(e) => setNewCatIcon(e.target.value)} 
                  placeholder="e.g. 🤖, 📱, 🎨"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category Name *</label>
                <input 
                  className="form-input" 
                  type="text" 
                  value={newCatName} 
                  onChange={(e) => setNewCatName(e.target.value)} 
                  placeholder="e.g. AI & Prompt Engineering"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input 
                  className="form-input" 
                  type="text" 
                  value={newCatDesc} 
                  onChange={(e) => setNewCatDesc(e.target.value)} 
                  placeholder="e.g. Machine Learning, LLMs, ChatGPT"
                />
              </div>

              <div className="modal-action-buttons" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Category →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
