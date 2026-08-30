// src/admin/pages/AdminCategoriesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import AdminCategoriesTable from '../components/AdminCategoriesTable';
import AdminSearchFilterBar from '../components/AdminSearchFilterBar';
import AdminActionModal from '../components/AdminActionModal';
import EmojiPickerMenu from '../../components/EmojiPickerMenu';
import '../admin.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add & Edit Full Category
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [showModal, setShowModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);

  // Dedicated Skills Manager Modal State
  const [skillsModal, setSkillsModal] = useState({
    open: false,
    category: null,
    search: '',
    newSkillInput: '',
    loading: false,
    success: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Category Form Fields
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('💻');
  const [catDesc, setCatDesc] = useState('');
  const [skillsList, setSkillsList] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Center Modal State for Alerts / Details / Delete
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
      if (data.success && Array.isArray(data.data?.categories)) {
        setCategories(data.data.categories);
        // If skills modal is open, refresh active category
        if (skillsModal.open && skillsModal.category) {
          const updatedActive = data.data.categories.find(c => (c.id || c._id) === (skillsModal.category.id || skillsModal.category._id));
          if (updatedActive) {
            setSkillsModal(prev => ({ ...prev, category: updatedActive }));
          }
        }
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Failed to load admin categories:', err);
      setCategories([]);
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
        (c.id && c.id.toString().toLowerCase().includes(search)) ||
        (c.displayId && c.displayId.toLowerCase().includes(search)) ||
        (Array.isArray(c.skills) && c.skills.some(s => s.toLowerCase().includes(search)));

      const matchesStatus = selectedStatus === 'All Status' ||
        (c.status && c.status.toLowerCase() === selectedStatus.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, selectedStatus]);

  // Open modal for creating new category
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingCatId(null);
    setCatName('');
    setCatIcon('💻');
    setCatDesc('');
    setSkillsList([]);
    setSkillInput('');
    setShowModal(true);
  };

  // Open modal for editing existing category
  const handleOpenEditModal = (cat) => {
    setModalMode('edit');
    setEditingCatId(cat.id || cat._id);
    setCatName(cat.name || '');
    setCatIcon(cat.icon || '⚡');
    setCatDesc(cat.description || '');
    setSkillsList(Array.isArray(cat.skills) ? [...cat.skills] : []);
    setSkillInput('');
    setShowModal(true);
  };

  // Open dedicated Skills Manager Modal for a category
  const handleOpenManageSkills = (cat) => {
    setSkillsModal({
      open: true,
      category: cat,
      search: '',
      newSkillInput: '',
      loading: false,
      success: ''
    });
  };

  // Quick Add Skill Trigger from Table
  const handleQuickAddSkill = (cat) => {
    handleOpenManageSkills(cat);
  };

  // Add a skill tag in full create/edit category form
  const handleAddSkillTag = (e) => {
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (!trimmed) return;

    const newSkills = trimmed.includes(',')
      ? trimmed.split(',').map(s => s.trim()).filter(Boolean)
      : [trimmed];

    setSkillsList(prev => [...new Set([...prev, ...newSkills])]);
    setSkillInput('');
  };

  // Remove a skill tag in full create/edit category form
  const handleRemoveSkillTag = (skillToRemove) => {
    setSkillsList(prev => prev.filter(s => s !== skillToRemove));
  };

  // Submit Category Create or Update
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setSubmitting(true);
    const token = localStorage.getItem('accessToken');

    try {
      const isEdit = modalMode === 'edit' && editingCatId;
      const url = isEdit ? `${API_BASE_URL}/admin/categories/${editingCatId}` : `${API_BASE_URL}/admin/categories`;
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
          'x-admin-token': 'admin2026'
        },
        body: JSON.stringify({
          name: catName.trim(),
          icon: catIcon || '⚡',
          description: catDesc.trim(),
          skills: skillsList
        })
      });

      if (response.ok) {
        setShowModal(false);
        fetchCategories();
      }
    } catch (err) {
      console.error('Error saving category:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Add Skill directly inside Dedicated Skills Manager Modal
  const handleAddSkillInManager = async (e) => {
    e.preventDefault();
    const cat = skillsModal.category;
    if (!cat) return;

    const input = skillsModal.newSkillInput.trim();
    if (!input) return;

    const addedSkills = input.includes(',')
      ? input.split(',').map(s => s.trim()).filter(Boolean)
      : [input];

    const currentSkills = Array.isArray(cat.skills) ? cat.skills : [];
    const updatedSkills = [...new Set([...currentSkills, ...addedSkills])];

    setSkillsModal(prev => ({ ...prev, loading: true, success: '' }));
    const token = localStorage.getItem('accessToken');
    const catId = cat.id || cat._id;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${catId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
          'x-admin-token': 'admin2026'
        },
        body: JSON.stringify({ skills: updatedSkills })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSkillsModal(prev => ({
          ...prev,
          category: { ...prev.category, skills: updatedSkills },
          newSkillInput: '',
          loading: false,
          success: `Added ${addedSkills.join(', ')} to ${cat.name}!`
        }));
        fetchCategories();
        setTimeout(() => setSkillsModal(prev => ({ ...prev, success: '' })), 2500);
      }
    } catch (err) {
      console.error('Failed to add skill:', err);
      setSkillsModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Remove Skill directly inside Dedicated Skills Manager Modal
  const handleRemoveSkillInManager = async (skillToRemove) => {
    const cat = skillsModal.category;
    if (!cat) return;

    const currentSkills = Array.isArray(cat.skills) ? cat.skills : [];
    const updatedSkills = currentSkills.filter(s => s !== skillToRemove);

    setSkillsModal(prev => ({
      ...prev,
      category: { ...prev.category, skills: updatedSkills }
    }));

    const token = localStorage.getItem('accessToken');
    const catId = cat.id || cat._id;

    try {
      await fetch(`${API_BASE_URL}/admin/categories/${catId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
          'x-admin-token': 'admin2026'
        },
        body: JSON.stringify({ skills: updatedSkills })
      });
      fetchCategories();
    } catch (err) {
      console.error('Failed to remove skill:', err);
    }
  };

  const handleDeleteCategoryClick = (cat) => {
    const catId = cat.id || cat._id;
    setModalConfig({
      isOpen: true,
      title: '🗑️ Delete Skill Category',
      icon: '🗑️',
      message: `Are you sure you want to permanently delete the category "${cat.name}"? Members will no longer be able to filter skills under this tag.`,
      confirmText: 'Yes, Delete Category',
      confirmType: 'danger',
      details: {
        'Category Name': `${cat.icon || '⚡'} ${cat.name}`,
        'Category ID': cat.displayId || `#CAT-${(catId || '').toString().slice(-6).toUpperCase()}`,
        'Attached Skills Count': `${(cat.skills || []).length} Skills`,
        'Total Members': `${cat.count || cat.memberCount || 0} Members`,
        'Status': cat.status || 'Active'
      },
      isDetailsOnly: false,
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, loading: true }));
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
            setCategories(prev => prev.filter(c => (c.id || c._id) !== catId));
          }
        } catch (err) {
          console.error('Failed to delete category:', err);
        }
        setModalConfig(prev => ({ ...prev, isOpen: false, loading: false }));
      }
    });
  };

  const handleViewDetails = (cat) => {
    const catId = cat.id || cat._id;
    const skills = Array.isArray(cat.skills) && cat.skills.length 
      ? cat.skills.join(', ') 
      : 'No specific skills added yet';

    setModalConfig({
      isOpen: true,
      title: '⚡ Skill Category Details',
      icon: '📋',
      message: `Detailed breakdown for category "${cat.name}".`,
      isDetailsOnly: true,
      details: {
        'Category Title': `${cat.icon || '⚡'} ${cat.name}`,
        'Category ID': cat.displayId || `#CAT-${(catId || '').toString().slice(-6).toUpperCase()}`,
        'Total Skills Count': `${(cat.skills || []).length} skills configured`,
        'Skills in this Category': skills,
        'Description': cat.description || 'General skill exchange category',
        'Member & Activity': `${cat.count || cat.memberCount || 0} registered members`,
        'Status': cat.status || 'Active'
      },
      onConfirm: null
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All Status');
  };

  // Filter skills inside the Skills Manager Modal
  const managerFilteredSkills = useMemo(() => {
    if (!skillsModal.category) return [];
    const list = Array.isArray(skillsModal.category.skills) ? skillsModal.category.skills : [];
    if (!skillsModal.search.trim()) return list;
    return list.filter(s => s.toLowerCase().includes(skillsModal.search.trim().toLowerCase()));
  }, [skillsModal.category, skillsModal.search]);

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
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2>Skill Categories &amp; Skills Directory</h2>
                <p>Manage platform categories, nested skill tags, and member classifications in real-time.</p>
              </div>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleOpenAddModal}
              >
                + Add New Category
              </button>
            </div>

            {/* Admin Search & Filter Bar */}
            <AdminSearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search categories or skills (e.g. React, Design, Python, Music)..."
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
              title={`Platform Skill Categories (${filteredCategories.length})`} 
              onManageSkills={handleOpenManageSkills}
              onQuickAddSkill={handleQuickAddSkill}
              onEditCategory={handleOpenEditModal}
              onDeleteCategory={handleDeleteCategoryClick}
              onViewDetails={handleViewDetails}
              loading={loading}
            />
          </main>
        </div>
      </div>

      {/* DEDICATED SKILLS MANAGER MODAL FOR SPECIFIC CATEGORY */}
      {skillsModal.open && skillsModal.category && (
        <div className="modal-overlay" onClick={() => setSkillsModal(prev => ({ ...prev, open: false }))}>
          <div 
            className="glass-panel logout-confirm-box clay-card-3d" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '580px', width: '94%', maxHeight: '90vh', overflowY: 'auto', padding: '2.2rem 2rem', borderRadius: '24px' }}
          >
            {/* Modal Header with Icon & Category Name */}
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>{skillsModal.category.icon || '⚡'}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>
                    {skillsModal.category.name} — Skills ({skillsModal.category.skills?.length || 0})
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--slate-500)' }}>
                    Add or remove skills taught and learned under this category
                  </p>
                </div>
              </div>
              <button type="button" className="close-modal-btn" onClick={() => setSkillsModal(prev => ({ ...prev, open: false }))}>✕</button>
            </div>

            {skillsModal.success && (
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '0.65rem 0.85rem', fontSize: '0.84rem', fontWeight: 600, marginBottom: '1rem' }}>
                ✓ {skillsModal.success}
              </div>
            )}

            {/* Quick Add Skill to This Category Form */}
            <form onSubmit={handleAddSkillInManager} style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                ➕ Add New Skill(s) to "{skillsModal.category.name}"
              </label>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <input
                  className="form-input"
                  type="text"
                  value={skillsModal.newSkillInput}
                  onChange={(e) => setSkillsModal(prev => ({ ...prev, newSkillInput: e.target.value }))}
                  placeholder="e.g. Next.js, Flutter, Docker (or comma-separated)"
                  style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px' }}
                  disabled={skillsModal.loading}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={skillsModal.loading || !skillsModal.newSkillInput.trim()}
                  style={{ padding: '0.75rem 1.35rem', borderRadius: '12px', whiteSpace: 'nowrap', fontWeight: 700 }}
                >
                  {skillsModal.loading ? 'Adding...' : '+ Add Skill'}
                </button>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--slate-400)', display: 'block', marginTop: '0.35rem' }}>
                💡 Tip: You can add multiple skills at once by separating them with commas (e.g. <code>React Native, SwiftUI, Kotlin</code>).
              </span>
            </form>

            {/* Search filter for skills in this category */}
            <div style={{ marginBottom: '0.85rem' }}>
              <input
                className="form-input"
                type="text"
                value={skillsModal.search}
                onChange={(e) => setSkillsModal(prev => ({ ...prev, search: e.target.value }))}
                placeholder={`Search among ${(skillsModal.category.skills || []).length} skills...`}
                style={{ width: '100%', padding: '0.6rem 0.9rem', fontSize: '0.84rem', borderRadius: '10px' }}
              />
            </div>

            {/* Interactive Skills Grid */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '0.85rem',
              background: 'rgba(241, 245, 249, 0.75)',
              borderRadius: '14px',
              border: '1.5px solid rgba(226, 232, 240, 0.9)',
              marginBottom: '1.4rem'
            }}>
              {managerFilteredSkills.length > 0 ? (
                managerFilteredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'white',
                      color: 'var(--violet-primary, #6c5ce7)',
                      border: '1px solid rgba(108, 92, 231, 0.25)',
                      borderRadius: '10px',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <span>⚡</span>
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkillInManager(skill)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0 0.15rem',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        lineHeight: 1
                      }}
                      title={`Remove "${skill}" from category`}
                    >
                      ✕
                    </button>
                  </span>
                ))
              ) : (
                <div style={{ textAlign: 'center', width: '100%', padding: '1.5rem 0', color: 'var(--slate-400)', fontSize: '0.86rem' }}>
                  {skillsModal.search ? 'No matching skills found.' : 'No skills in this category yet. Type a skill name above!'}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                Total: <strong>{skillsModal.category.skills?.length || 0} skills</strong> saved in MongoDB
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSkillsModal(prev => ({ ...prev, open: false }))}
                style={{ padding: '0.65rem 1.4rem', borderRadius: '12px' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL CATEGORY CREATE / EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-panel logout-confirm-box clay-card-3d" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '94%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{catIcon}</span>
                <h3 style={{ margin: 0 }}>{modalMode === 'edit' ? 'Edit Category & Skills' : 'Add New Category'}</h3>
              </div>
              <button type="button" className="close-modal-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveCategory} className="edit-profile-form">
              {/* Category Emoji Picker */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--slate-700)' }}>Category Icon *</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--violet-primary, #6c5ce7)', fontWeight: 700 }}>
                    Selected: <span style={{ fontSize: '1.3rem', verticalAlign: 'middle' }}>{catIcon}</span>
                  </span>
                </label>
                
                <EmojiPickerMenu 
                  selectedEmoji={catIcon} 
                  onSelectEmoji={(emoji) => setCatIcon(emoji)} 
                />
              </div>

              {/* Category Name */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', color: 'var(--slate-700)', marginBottom: '0.35rem' }}>
                  Category Name *
                </label>
                <input 
                  className="form-input" 
                  type="text" 
                  value={catName} 
                  onChange={(e) => setCatName(e.target.value)} 
                  placeholder="e.g. Web Development, Design & Creative, AI & ML"
                  required
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              {/* Category Description */}
              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', color: 'var(--slate-700)', marginBottom: '0.35rem' }}>
                  Description
                </label>
                <input 
                  className="form-input" 
                  type="text" 
                  value={catDesc} 
                  onChange={(e) => setCatDesc(e.target.value)} 
                  placeholder="e.g. Learn frontend, backend, APIs, and modern frameworks"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              {/* Skills under this Category */}
              <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', color: 'var(--slate-700)', marginBottom: '0.35rem' }}>
                  🎯 Skills inside this Category ({skillsList.length})
                </label>

                {/* Add Skill Input Row */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    className="form-input"
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkillTag();
                      }
                    }}
                    placeholder="Type skill (e.g. React JS, Python, Figma) and press Enter"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-pill-sm"
                    onClick={handleAddSkillTag}
                    style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
                  >
                    + Add Skill
                  </button>
                </div>

                {/* Skill Tag Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', minHeight: '40px', padding: '0.6rem', background: 'rgba(241, 245, 249, 0.7)', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  {skillsList.length > 0 ? (
                    skillsList.map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'white',
                          color: 'var(--violet-primary, #6c5ce7)',
                          border: '1px solid rgba(108, 92, 231, 0.25)',
                          borderRadius: '10px',
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        <span>⚡</span>
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillTag(skill)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0 0.2rem',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            lineHeight: 1
                          }}
                          title={`Remove ${skill}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.82rem', color: 'var(--slate-400)', fontStyle: 'italic', alignSelf: 'center', margin: 'auto' }}>
                      No skills added yet. Type above and click "+ Add Skill".
                    </span>
                  )}
                </div>
              </div>

              <div className="modal-action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="action-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : modalMode === 'edit' ? `Save Category & Skills 💾` : `Create Category & Skills ${catIcon} →`}
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
