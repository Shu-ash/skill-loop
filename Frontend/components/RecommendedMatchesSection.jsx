import React from 'react';
import { Link } from 'react-router-dom';
import MatchCard from './MatchCard';
import SkillLoopLoader from './SkillLoopLoader';

export default function RecommendedMatchesSection({ matches = [], onRequestSwap, loading = false }) {
  return (
    <div className="recommended-matches-section">
      {/* Section Header Row */}
      <div className="section-header-row">
        <h3>Recommended matches for you</h3>
        <Link to="/browse" className="see-all-link">
          Browse all members &rarr;
        </Link>
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
        ) : matches.length > 0 ? (
          matches.map((match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              onRequestSwap={onRequestSwap} 
            />
          ))
        ) : (
          <div className="glass-panel matches-empty-card">
            <span className="matches-empty-icon">🤝</span>
            <p className="matches-empty-text">
              No match recommendations right now. Explore the <Link to="/browse" className="matches-empty-link">Browse Skills</Link> directory to find mentors!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
