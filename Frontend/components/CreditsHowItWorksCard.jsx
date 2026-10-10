// src/components/CreditsHowItWorksCard.jsx
import React from 'react';

// CreditsHowItWorksCard: Explainer widget summarizing Skill Credit system rules
export default function CreditsHowItWorksCard() {
  return (
    <div className="glass-panel credits-explainer-card">
      <h3>How credits work</h3>
      <p className="explainer-text">
        Teach anyone → earn 1 credit. Spend that credit learning from anyone else. 
        No direct A ↔ B match required — the whole community is liquid.
      </p>

      <div className="credit-rule-indicator">
        <span className="rule-bar-fill"></span>
      </div>
      <p className="rule-subtext">Balance never goes negative — enforced automatically.</p>
    </div>
  );
}
