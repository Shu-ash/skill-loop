// src/components/ErrorBoundary.jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SkillLoop UI Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '2.5rem',
            borderRadius: '24px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 20px 40px rgba(108, 92, 231, 0.15)',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--slate-900)' }}>
              Something went wrong
            </h2>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              We encountered an unexpected problem rendering this page. You can try refreshing or returning to the dashboard.
            </p>
            {this.state.error?.message && (
              <div style={{
                background: '#fef2f2',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.82rem',
                marginBottom: '1.5rem',
                wordBreak: 'break-word',
                fontFamily: 'monospace'
              }}>
                {this.state.error.message}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleReset}
              >
                ↻ Refresh Page
              </button>
              <a
                href="/dashboard"
                className="btn btn-secondary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
