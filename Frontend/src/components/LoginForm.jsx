//src/components/LoginForm.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginForm({ onSwitchToSignup }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="auth-fade-form">
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

      {/* Password with Show/Hide */}
      <div className="form-group">
        <label className="form-label">Password</label>
        <div className="password-input-wrap">
          <input
            className="form-input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
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

      {/* Remember Me & Forgot Password */}
      <div className="auth-extra-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>
        <a
          href="#forgot"
          className="forgot-password-link"
          onClick={(e) => {
            e.preventDefault();
            alert('Password reset link sent to your email!');
          }}
        >
          Forgot password?
        </a>
      </div>

      <button type="submit" className="btn btn-primary btn-full btn-auth-submit">
        Log in to SkillLoop &rarr;
      </button>

      {/* Bottom Switch Prompt */}
      {onSwitchToSignup && (
        <div className="auth-switch-prompt">
          <span>New to SkillLoop?</span>{' '}
          <button type="button" className="auth-switch-btn" onClick={onSwitchToSignup}>
            Create an account
          </button>
        </div>
      )}
    </form>
  );
}