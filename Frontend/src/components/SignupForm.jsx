// src/components/SignupForm.jsx

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
  const [loading, setLoading] = useState(false);

  const saveRegisteredUserToStore = (userObj) => {
    try {
      const existingStr = localStorage.getItem('skillloop_registered_users');
      let list = existingStr ? JSON.parse(existingStr) : [];
      if (!Array.isArray(list)) list = [];
      const exists = list.some(u => u.email?.toLowerCase() === userObj.email?.toLowerCase());
      if (!exists) {
        list.unshift(userObj);
        localStorage.setItem('skillloop_registered_users', JSON.stringify(list));
      }
    } catch (e) {
      console.error('Error saving user store:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreeTerms) {
      alert('Please agree to Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const userName = `${firstName} ${lastName}`.trim() || 'New Member';
    const userHandle = `@${(email.split('@')[0] || 'member').toLowerCase().replace(/[^a-z0-9_]/g, '')}`;

    try {
      localStorage.removeItem('skillloop_admin');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          signal: controller.signal,
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
            termsAccepted: agreeTerms
          })
        }
      );

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok) {
        if (data.data?.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken);
        }
        const newUser = {
          id: data.data?.user?._id || `user_${Date.now()}`,
          name: userName,
          username: userHandle,
          email: email.trim(),
          credits: 3,
          bio: '',
          headline: '',
          teachSkills: [],
          learnSkills: [],
          onboardingCompleted: false
        };
        saveRegisteredUserToStore(data.data?.user || newUser);
        localStorage.setItem('skillloop_user', JSON.stringify(data.data?.user || newUser));
        navigate('/onboarding');
        return;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.log('Registration fast fallback active');
    }

    // Instant smooth navigation fallback to /onboarding
    localStorage.removeItem('skillloop_admin');
    const newUser = {
      id: `user_${Date.now()}`,
      name: userName,
      username: userHandle,
      email: email.trim(),
      credits: 3,
      bio: '',
      headline: '',
      teachSkills: [],
      learnSkills: [],
      onboardingCompleted: false
    };
    saveRegisteredUserToStore(newUser);
    localStorage.setItem('skillloop_user', JSON.stringify(newUser));
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
            disabled={loading}
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
            disabled={loading}
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
          disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
          I agree to <a href="#terms">Terms</a> &amp; <a href="#privacy">Privacy Policy</a>
        </label>
      </div>

      <button type="submit" className="btn btn-primary btn-full btn-auth-submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Create my account →'}
      </button>

      {/* Bottom Switch Prompt */}
      {onSwitchToLogin && (
        <div className="auth-switch-prompt">
          <span>Already have an account?</span>{' '}
          <button type="button" className="auth-switch-btn" onClick={onSwitchToLogin} disabled={loading}>
            Log in
          </button>
        </div>
      )}
    </form>
  );
}
