// src/components/CreditsRuleSection.jsx
import React from 'react';

// CreditsRuleSection: Visual card explaining liquid Skill Credits vs direct bartering
export default function CreditsRuleSection() {
  return (
    <section className="credits-rule-section glass-panel">
      <div className="credits-rule-text">
        <span className="pill-badge pill-gold">WHY SKILL CREDITS?</span>
        <h2>No direct 1:1 barter required.</h2>
        <p>
          Traditional skill swapping breaks because Person A might not want what Person B teaches. 
          SkillLoop solves this with <strong>Liquid Skill Credits</strong>:
        </p>

        <ul className="rule-bullets-list">
          <li>✨ <strong>Teach Person A</strong> ➔ You earn 1 Skill Credit</li>
          <li>🎓 <strong>Spend that credit</strong> ➔ Learn from Person C or D</li>
          <li>🛡️ <strong>Always fair</strong> ➔ 1 Session = 1 Skill Credit (45 mins)</li>
        </ul>
      </div>

      <div className="credits-diagram-box">
        <div className="diagram-node node-a">You Teach HTML ➔ +1 Credit</div>
        <div className="diagram-arrow">↓</div>
        <div className="diagram-node node-b">Spend 1 Credit ➔ Learn Piano</div>
      </div>
    </section>
  );
}
