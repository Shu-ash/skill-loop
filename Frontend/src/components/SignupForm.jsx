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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreeTerms) {
      alert('Please agree to Terms of Service & Privacy Policy.');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
            termsAccepted: agreeTerms
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Registration failed (${response.status})`);
      }

      console.log('Registration successful:', data);

      // Save access token if your backend returns one
      if (data.data?.accessToken) {
        localStorage.setItem(
          'accessToken',
          data.data.accessToken
        );
      }

      // Save user information for frontend
      if (data.data?.user) {
        localStorage.setItem(
          'skillloop_user',
          JSON.stringify({
            ...data.data.user,
            onboardingCompleted: false,
          })
        );
      }

      // Registration succeeded
      navigate('/onboarding');

    } catch (error) {
      console.error('Registration error:', error);

      alert(
        error.message || 'Unable to connect to the server.'
      );
    }
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

      <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1.2rem' }}>
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
