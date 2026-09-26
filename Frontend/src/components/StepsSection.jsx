//src/components/StepsSection.jsx
import React from 'react';

export default function StepsSection() {
  const steps = [
    { num: 1, title: 'Discover Skills', desc: "Browse skills you want to learn or teach in the community." },
    { num: 2, title: 'Connect & Swap', desc: "Find the right member, send a swap request, and schedule." },
    { num: 3, title: 'Learn & Teach', desc: "Share knowledge live on a video call link and grow together." },
    { num: 4, title: 'Earn & Grow', desc: "Earn Skill Credits and unlock new learning opportunities." }
  ];

  return (
    <section className="steps-section steps-section-centered">
      <p className="section-subtitle">THE LOOP JOURNEY</p>
      <h2 className="section-title">How SkillLoop Works</h2>
      
      <div className="steps-journey-container centered-steps-wrapper">
        <div className="steps-grid-4">
          {steps.map(step => (
            <div key={step.num} className="glass-panel step-card clay-card-3d">
              <div className="step-number-badge">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
