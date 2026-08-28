//src/components/SignupForm.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignupForm({ onSwitchToLogin }) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Please agree to Terms of Service & Privacy Policy.');
      return;
    }
    // Save user basic info & navigate to onboarding for first-time profile setup
    const initialUser = {
      name: `${firstName} ${lastName}`.trim() || 'Harsh',
      email: email,
      onboardingCompleted: false
    };
    localStorage.setItem('skillloop_user', JSON.stringify(initialUser));
    navigate('/onboarding');
  };

  return (
    <form onSubmit={handleSubmit} className="auth-fade-form">
      {/* Name Row */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">First name</label>
          <input
            className="form-input"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Last name</label>
          <input
            className="form-input"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="form-group">
        <label className="form-label">Email address</label>
        <input
          className="form-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>

      {/* Password */}
      <div className="form-group">
        <label className="form-label">Password</label>
        <div className="password-input-wrap">
          <input
            className="form-input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Terms & Privacy */}
      <div className="auth-extra-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
          />
          I agree to <a href="#terms">Terms</a> &amp; <a href="#privacy">Privacy Policy</a>
        </label>
      </div>

      <button type="submit" className="btn btn-primary btn-full btn-auth-submit">
        Create my account &rarr;
      </button>

      {/* Bottom Switch Prompt */}
      {onSwitchToLogin && (
        <div className="auth-switch-prompt">
          <span>Already have an account?</span>{' '}
          <button type="button" className="auth-switch-btn" onClick={onSwitchToLogin}>
            Log in
          </button>
        </div>
      )}
    </form>
  );
}