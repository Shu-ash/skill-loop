// src/components/HowItWorksSteps.jsx
import React from 'react';

// HowItWorksSteps: 3-step breakdown cards detailing List, Match, and Trade steps
export default function HowItWorksSteps() {
  const steps = [
    {
      step: 1,
      color: 'var(--violet-primary)',
      title: 'List your skills',
      desc: 'Add what you can teach (HTML, Guitar, Figma) and what you want to learn. Takes 2 minutes during onboarding.'
    },
    {
      step: 2,
      color: 'var(--mint-primary)',
      title: 'Match & swap',
      desc: 'Browse community members, filter by online or in-person availability, send a swap request, and pick a time slot.'
    },
    {
      step: 3,
      color: 'var(--coral-primary)',
      title: 'Earn & spend credits',
      desc: 'Teaching a 45-minute call earns 1 Skill Credit. Spend that credit learning literally any skill from anyone else.'
    }
  ];

  return (
    <section className="how-steps-section">
      <div className="section-header-center">
        <span className="pill-badge pill-mint">THE 3-STEP LOOP</span>
        <h2>Three steps. Zero cost.</h2>
      </div>

      <div className="how-steps-grid">
        {steps.map((item) => (
          <div key={item.step} className="glass-panel how-step-card">
            <div className="step-badge-icon" style={{ background: item.color }}>
              {item.step}
            </div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
