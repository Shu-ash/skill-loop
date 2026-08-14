//src/pages/LandingPage.jsx

import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import StepsSection from '../components/StepsSection';
import CategoriesSection from '../components/CategoriesSection';
import CtaSection from '../components/CtaSection';

export default function LandingPage() {
  return (
    <>
      {/* Dynamic Animated Liquid Background */}
      <div class="liquid-bg">
        <div class="liquid-blob blob-1"></div>
        <div class="liquid-blob blob-2"></div>
        <div class="liquid-blob blob-3"></div>
      </div>

      <Navbar />
      <HeroSection />

      {/* Main content stack: Steps, Categories, CTA */}

      <div class="landing-body-stack" id="how-it-works">
        <StepsSection />
        <CategoriesSection />
        <CtaSection />
      </div>
    </>
  );
}