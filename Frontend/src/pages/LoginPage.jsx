//src/pages/LoginPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthVisualSide from '../components/AuthVisualSide';
import AuthTabNav from '../components/AuthTabNav';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import SocialAuthBtns from '../components/SocialAuthBtns';

export default function LoginPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const requestedMode = location.state?.mode || (searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  
  const [authMode, setAuthMode] = useState(requestedMode); // 'login' | 'signup'

  useEffect(() => {
    if (location.state?.mode) {
      setAuthMode(location.state.mode);
    } else if (searchParams.get('mode') === 'signup') {
      setAuthMode('signup');
    }
  }, [location]);

  return (
    <>
      <div className="liquid-bg">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
      </div>

      <div id="app">
        <header className="navbar">
          <Link className="brand-logo" to="/">
            <div className="brand-icon">
              <span className="circle-violet"></span>
              <span className="circle-mint"></span>
            </div>
            <span className="brand-name">Skill<span>Loop</span></span>
          </Link>

          <div className="nav-actions">
            <Link className="btn btn-secondary btn-pill-sm" to="/">
              &larr; Back home
            </Link>
          </div>
        </header>

        <main className="auth-portal-theme">
          <div className="auth-glass-portal">
            {/* Component 1: Visual Left Side */}
            <AuthVisualSide />

            {/* Right Side Auth Box */}
            <div className="auth-form-side">
              {/* Component 2: Tab Nav */}
              <AuthTabNav authMode={authMode} setAuthMode={setAuthMode} />

              {/* Form Container with Smooth Transition Key */}
              <div key={authMode} className="auth-form-animated-wrap">
                {authMode === 'login' ? (
                  <LoginForm onSwitchToSignup={() => setAuthMode('signup')} />
                ) : (
                  <SignupForm onSwitchToLogin={() => setAuthMode('login')} />
                )}
              </div>

              {/* Component 5: Social Sign-In Buttons */}
              <SocialAuthBtns />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}