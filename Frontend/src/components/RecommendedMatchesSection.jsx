import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MatchCard from './MatchCard';
import SkillLoopLoader from './SkillLoopLoader';

export default function RecommendedMatchesSection({ 
  matches = [], 
  recommendations = [], 
  mutualMatches = [],
  learnMatches = [],
  teachMatches = [],
  similarMatches = [],
  onRequestSwap, 
  onEditSkills,
  loading = false 
}) {
  const [activeTab, setActiveTab] = useState('all');

  // Consolidate list from matches or recommendations props
  const allList = useMemo(() => {
    const list = (matches && matches.length ? matches : recommendations) || [];
    return list;
  }, [matches, recommendations]);

  const mutualList = useMemo(() => {
    if (mutualMatches && mutualMatches.length) return mutualMatches;
    return allList.filter((m) => m.isMutual || m.matchType === 'mutual');
  }, [mutualMatches, allList]);

  const learnList = useMemo(() => {
    if (learnMatches && learnMatches.length) return learnMatches;
    return allList.filter((m) => m.isLearnMatch || m.matchType === 'learn' || (m.canTeachMe && m.canTeachMe.length > 0));
  }, [learnMatches, allList]);

  const teachList = useMemo(() => {
    if (teachMatches && teachMatches.length) return teachMatches;
    return allList.filter((m) => m.isTeachMatch || m.matchType === 'teach' || (m.canLearnFromMe && m.canLearnFromMe.length > 0));
  }, [teachMatches, allList]);

  const similarList = useMemo(() => {
    if (similarMatches && similarMatches.length) return similarMatches;
    return allList.filter((m) => m.isSimilar || m.matchType === 'similar' || (m.similarSkills && m.similarSkills.length > 0));
  }, [similarMatches, allList]);

  const displayedList = useMemo(() => {
    switch (activeTab) {
      case 'mutual':
        return mutualList;
      case 'learn':
        return learnList;
      case 'teach':
        return teachList;
      case 'similar':
        return similarList;
      case 'all':
      default:
        return allList;
    }
  }, [activeTab, allList, mutualList, learnList, teachList, similarList]);

  const tabs = [
    { id: 'all', label: '✨ All Matches', count: allList.length },
    { id: 'mutual', label: '🤝 2-Way Swaps', count: mutualList.length },
    { id: 'learn', label: '🎓 Teaches Your Goals', count: learnList.length },
    { id: 'teach', label: '💡 Wants Your Skills', count: teachList.length },
    { id: 'similar', label: '⚡ Similar Skills', count: similarList.length }
  ];

  return (
    <div className="recommended-matches-section">
      {/* Section Header Row */}
      <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            🎯 Smart Skill Matches for You
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Peer recommendations calculated from what you teach &amp; what you want to learn.
          </p>
        </div>
        <Link to="/browse" className="see-all-link" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--violet-primary)' }}>
          Browse all members &rarr;
        </Link>
      </div>

      {/* Matching Category Tabs */}
      <div className="dashboard-matches-tabs" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '1rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pill-badge ${activeTab === tab.id ? 'pill-violet' : 'pill-gray'}`}
            style={{
              padding: '0.45rem 0.95rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeTab === tab.id ? '1px solid var(--violet-primary)' : '1px solid rgba(226, 232, 240, 0.8)',
              background: activeTab === tab.id ? 'var(--violet-primary)' : 'var(--glass-card)',
              color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label} {tab.count > 0 ? `(${tab.count})` : ''}
          </button>
        ))}
      </div>

      {/* Matches Cards Grid */}
      <div className="matches-cards-grid">
        {loading ? (
          <div className="grid-col-full">
            <SkillLoopLoader
              title="Finding Skill Matches"
              subtitle="Matching your profile with community members in MongoDB..."
              badgeText="MongoDB Live Sync"
              variant="card"
            />
          </div>
        ) : displayedList.length > 0 ? (
          displayedList.map((match) => (
            <MatchCard 
              key={match.id || match._id} 
              match={match} 
              onRequestSwap={onRequestSwap} 
            />
          ))
        ) : (
          <div className="glass-panel matches-empty-card" style={{ padding: '36px 20px', textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>
            <span className="matches-empty-icon" style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>
              {activeTab === 'mutual' ? '🤝' : activeTab === 'learn' ? '🎓' : activeTab === 'teach' ? '💡' : '⚡'}
            </span>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              {activeTab === 'mutual' 
                ? 'No Direct 2-Way Matches Yet' 
                : activeTab === 'learn' 
                ? 'No Direct Teachers Found For Your Learning Goals' 
                : activeTab === 'teach' 
                ? 'No Direct Learners Found For Your Teaching Skills' 
                : 'No Matches In This Category'}
            </h4>
            <p className="matches-empty-text" style={{ maxWidth: '440px', margin: '0 auto 16px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Add more skills you want to learn or teach to unlock instant reciprocal matches across the community!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {onEditSkills && (
                <button
                  type="button"
                  className="btn btn-primary btn-pill-sm"
                  onClick={onEditSkills}
                >
                  ✏️ Edit Your Skills
                </button>
              )}
              <Link to="/browse" className="btn btn-secondary btn-pill-sm">
                🔍 Explore All Skills
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
