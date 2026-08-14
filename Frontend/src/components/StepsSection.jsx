//src/components/StepsSection.jsx

import React from 'react';
export default function StepsSection() {

    // Define the steps data
  const steps = [
    { num: 1, title: 'List your skills', desc: "Add what you can teach and what you're dying to learn. Takes two minutes.", bg: 'var(--violet-primary)' },
    { num: 2, title: 'Match & swap', desc: "Browse the community, send a swap request, and schedule a session on a call link.", bg: 'var(--mint-primary)' },
    { num: 3, title: 'Earn & spend credits', desc: "Teaching earns a credit. Spend it learning from literally anyone else on SkillLoop.", bg: 'var(--coral-primary)' }
  ];

  return (
    <section className="steps-section">

        {/* Section content */}
      <p className="section-subtitle">THE LOOP</p>
      <h2 className="section-title">Three steps. Zero cost.</h2>
      <div className="steps-grid">

        {/* steps cards */}
        {steps.map(step => (
          <div key={step.num} className="glass-panel step-card">
            <div className="step-number" style={{ background: step.bg }}>{step.num}</div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}