// src/components/FaqAccordion.jsx
import React, { useState } from 'react';

// FaqAccordion: Interactive collapsible FAQ section for common user questions
export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'Is SkillLoop 100% free to use?',
      a: 'Yes! SkillLoop is completely free. No money changes hands — you trade your knowledge using Skill Credits.'
    },
    {
      q: 'Do Skill Credits expire?',
      a: 'No, your earned Skill Credits never expire. You can spend them whenever you are ready to learn a new skill.'
    },
    {
      q: 'What happens if a partner cancels or misses a session?',
      a: 'If a session is cancelled before starting, no credits are deducted. If someone misses a scheduled call, you can report it to support and your credit will be returned.'
    },
    {
      q: 'How long is each skill session?',
      a: 'Standard sessions are 45 minutes long, giving enough time to teach a concept and answer questions.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="faq-section">
      <div className="section-header-center">
        <span className="pill-badge pill-violet">FREQUENTLY ASKED QUESTIONS</span>
        <h2>Got questions? We've got answers.</h2>
      </div>

      <div className="faq-list">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              className={`glass-panel faq-item ${isOpen ? 'open' : ''}`}
            >
              <div className="faq-question-row" onClick={() => toggleFaq(idx)}>
                <h4>{faq.q}</h4>
                <span className="faq-toggle-icon">+</span>
              </div>
              <div className="faq-answer-wrapper">
                <div className="faq-answer-content">
                  <p className="faq-answer-text">{faq.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
