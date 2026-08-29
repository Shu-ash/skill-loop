// src/pages/LandingPage.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import StepsSection from '../components/StepsSection';
import CategoriesSection from '../components/CategoriesSection';
import CtaSection from '../components/CtaSection';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <>
      {/* Dynamic Animated Liquid Background */}
      <div className="liquid-bg">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
      </div>

      <Navbar />
      <HeroSection />

      {/* Main content stack: Steps, Categories, CTA */}
      <div className="landing-body-stack" id="how-it-works">
        <StepsSection />
        <CategoriesSection />
        <CtaSection />
      </div>

      <Footer />
    </>
  );
}