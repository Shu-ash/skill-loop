// src/admin/pages/AdminCategoriesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminCategoriesTable from '../components/AdminCategoriesTable';
import AdminSearchFilterBar from '../components/AdminSearchFilterBar';
import AdminActionModal from '../components/AdminActionModal';
import '../admin.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('⚡');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Center Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    icon: '⚠️',
    message: '',
    confirmText: 'Confirm',
    confirmType: 'primary',
    details: null,
    isDetailsOnly: false,
    onConfirm: null,
    loading: false
  });

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

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const search = searchQuery.trim().toLowerCase();
      const matchesSearch = !search ||
        (c.name && c.name.toLowerCase().includes(search)) ||
        (c.description && c.description.toLowerCase().includes(search)) ||
        (c.id && c.id.toLowerCase().includes(search)) ||
        (c.displayId && c.displayId.toLowerCase().includes(search));

      const matchesStatus = selectedStatus === 'All Status' ||
        (c.status && c.status.toLowerCase() === selectedStatus.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, selectedStatus]);

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

  const handleDeleteCategoryClick = (cat) => {
    setModalConfig({
      isOpen: true,
      title: '🗑️ Delete Skill Category',
      icon: '🗑️',
      message: `Are you sure you want to permanently delete the category "${cat.name}"? Members will no longer be able to filter skills under this tag.`,
      confirmText: 'Yes, Delete Category',
      confirmType: 'danger',
      details: {
        'Category Name': `${cat.icon || '⚡'} ${cat.name}`,
        'Category ID': cat.displayId || `#CAT-${(cat.id || '').toString().slice(-6).toUpperCase()}`,
        'Total Members': `${cat.count || cat.memberCount || 0} Members`,
        'Status': cat.status || 'Active'
      },
      isDetailsOnly: false,
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, loading: true }));
        const token = localStorage.getItem('accessToken');
        try {
          const response = await fetch(`${API_BASE_URL}/admin/categories/${cat.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token || ''}`,
              'x-admin-token': 'admin2026'
            }
          });

          if (response.ok) {
            setCategories(prev => prev.filter(c => c.id !== cat.id));
          }
        } catch (err) {
          console.error('Failed to delete category:', err);
        }
        setModalConfig(prev => ({ ...prev, isOpen: false, loading: false }));
      }
    });
  };

  const handleViewDetails = (cat) => {
    setModalConfig({
      isOpen: true,
      title: '⚡ Skill Category Details',
      icon: '📋',
      message: `Detailed breakdown for category "${cat.name}".`,
      isDetailsOnly: true,
      details: {
        'Category Title': `${cat.icon || '⚡'} ${cat.name}`,
        'Category ID': cat.displayId || `#CAT-${(cat.id || '').toString().slice(-6).toUpperCase()}`,
        'Description': cat.description || 'General skill exchange category',
        'Member & Skill Count': `${cat.count || cat.memberCount || 0} registered members`,
        'Status': cat.status || 'Active'
      },
      onConfirm: null
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All Status');
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
                <p>Manage skill categories, platform tags, and member classifications.</p>
              </div>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                + Add New Category
              </button>
            </div>

            {/* Admin Search & Filter Bar */}
            <AdminSearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search categories by name, tag, description, or ID..."
              filters={[
                {
                  label: 'Status',
                  value: selectedStatus,
                  onChange: setSelectedStatus,
                  options: ['All Status', 'Active', 'Inactive']
                }
              ]}
              onClearFilters={handleClearFilters}
            />

            <AdminCategoriesTable 
              categories={filteredCategories} 
              title={`System Skill Categories (${filteredCategories.length})`} 
              onDeleteCategory={handleDeleteCategoryClick}
              onViewDetails={handleViewDetails}
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

      {/* Center Screen Confirmation & Details Modal */}
      <AdminActionModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        icon={modalConfig.icon}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        confirmType={modalConfig.confirmType}
        details={modalConfig.details}
        isDetailsOnly={modalConfig.isDetailsOnly}
        loading={modalConfig.loading}
      />
    </>
  );
}
