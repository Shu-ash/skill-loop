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
        {matches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            onRequestSwap={onRequestSwap} 
          />
        ))}
      </div>
    </div>
  );
}
