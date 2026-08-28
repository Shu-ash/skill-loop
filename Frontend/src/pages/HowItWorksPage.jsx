// src/pages/HowItWorksPage.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import HowItWorksHero from '../components/HowItWorksHero';
import HowItWorksSteps from '../components/HowItWorksSteps';
import CreditsRuleSection from '../components/CreditsRuleSection';
import FaqAccordion from '../components/FaqAccordion';
import CtaSection from '../components/CtaSection';

// HowItWorksPage: Main page explaining the SkillLoop peer-to-peer concept
export default function HowItWorksPage() {
  return (
    <>
      <div className="liquid-bg">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
      </div>

      <div id="app">
        <Navbar />

        <main className="how-it-works-container">
          {/* Section 1: Hero Banner */}
          <HowItWorksHero />

          {/* Section 2: 3 Core Steps */}
          <HowItWorksSteps />

          {/* Section 3: Liquid Credits Rule Explainer */}
          <CreditsRuleSection />

          {/* Section 4: FAQ Accordion */}
          <FaqAccordion />

          {/* Section 5: CTA Banner */}
          <div className="how-it-works-bottom">
            <CtaSection />
          </div>
        </main>

        <MobileNav />
      </div>
    </>
  );
}
