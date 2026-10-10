// src/admin/components/AdminCategoriesTable.jsx
import React from 'react';
import SkillLoopLoader from '../../components/SkillLoopLoader';

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
      <div className="table-header-row">
        <h3 className="table-header-title">{title}</h3>
        <span className="admin-count-pill">
          {loading ? 'Loading...' : `${list.length} ${list.length === 1 ? 'category' : 'categories'}`}
        </span>
      </div>

      {loading ? (
        <SkillLoopLoader
          title="Loading Skill Categories"
          subtitle="Connecting to MongoDB category collection & nested skills..."
          badgeText="MongoDB Live Sync"
          variant="transparent"
        />
      ) : list.length === 0 ? (
        <div className="admin-table-empty">
          <span className="admin-table-empty-icon">🏷️</span>
          <h4 className="admin-table-empty-title">No Categories in Database</h4>
          <p className="admin-table-empty-desc">
            Click <strong>"+ Add New Category"</strong> above to create your first skill category with custom skills and emojis!
          </p>
        </div>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th className="nowrap-cell">Category ID</th>
              <th>Category Name</th>
              <th>Skills Count &amp; Tags</th>
              <th>Members</th>
              <th>Status</th>
              <th className="nowrap-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((cat) => {
              const formattedId = cat.displayId || `#CAT-${(cat.id || cat._id || '').toString().slice(-6).toUpperCase()}`;
              const skillsList = Array.isArray(cat.skills) ? cat.skills : [];

              return (
                <tr key={cat.id || cat._id}>
                  <td className="nowrap-cell">
                    <span className="user-id-badge" title={`Full ID: ${cat.id || cat._id}`}>
                      {formattedId}
                    </span>
                  </td>
                  <td className="nowrap-cell">
                    <span className="category-icon-preview">{cat.icon || '⚡'}</span>
                    <strong>{cat.name}</strong>
                  </td>
                  <td>
                    <div className="category-info-col">
                      <div className="category-row-top">
                        <span 
                          className="pill pill-violet category-skill-pill" 
                          onClick={() => onManageSkills && onManageSkills(cat)}
                          title="Click to manage skills in this category"
                        >
                          ✨ {skillsList.length} {skillsList.length === 1 ? 'Skill' : 'Skills'}
                        </span>

                        <button
                          type="button"
                          className="action-btn btn-quick-add-skill"
                          onClick={() => onQuickAddSkill && onQuickAddSkill(cat)}
                          title={`Add new skill to ${cat.name}`}
                        >
                          + Add Skill
                        </button>
                      </div>

                      {skillsList.length > 0 ? (
                        <div className="category-skills-tags-wrap">
                          {skillsList.slice(0, 3).map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="category-nested-skill-tag"
                            >
                              {skill}
                            </span>
                          ))}
                          {skillsList.length > 3 && (
                            <span 
                              className="category-more-skills-link"
                              onClick={() => onManageSkills && onManageSkills(cat)}
                              title="Click to view all skills"
                            >
                              +{skillsList.length - 3} more →
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-subtle category-no-skills-msg">
                          No skills added yet
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="nowrap-cell">{cat.count || cat.memberCount || 0} Members</td>
                  <td>
                    <span className="pill pill-active">{cat.status || 'Active'}</span>
                  </td>
                  <td className="nowrap-cell">
                    <div className="table-actions-row">
                      {onManageSkills && (
                        <button
                          type="button"
                          className="action-btn btn-manage-skills"
                          onClick={() => onManageSkills(cat)}
                          title="Manage Skills in this Category"
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
