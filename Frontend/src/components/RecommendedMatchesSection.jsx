// src/components/RecommendedMatchesSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import MatchCard from './MatchCard';

export default function RecommendedMatchesSection({ matches = [], onRequestSwap }) {
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
        {matches.length > 0 ? (
          matches.map((match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              onRequestSwap={onRequestSwap} 
            />
          ))
        ) : (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '2rem 1.5rem', textAlign: 'center', borderRadius: '20px' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.4rem' }}>🤝</span>
            <p style={{ margin: 0, color: 'var(--slate-500)', fontSize: '0.9rem' }}>
              No match recommendations right now. Explore the <Link to="/browse" style={{ color: 'var(--violet-primary, #6c5ce7)', fontWeight: 600 }}>Browse Skills</Link> directory to find mentors!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
