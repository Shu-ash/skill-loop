// src/components/ErrorBoundary.jsx
import React from 'react';
import './ErrorBoundary.css';

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
        <div className="error-boundary-container">
          <div className="glass-panel error-boundary-card">
            <div className="error-boundary-icon">⚠️</div>
            <h2 className="error-boundary-title">
              Something went wrong
            </h2>
            <p className="error-boundary-message">
              We encountered an unexpected problem rendering this page. You can try refreshing or returning to the dashboard.
            </p>
            {this.state.error?.message && (
              <div className="error-boundary-details">
                {this.state.error.message}
              </div>
            )}
            <div className="error-boundary-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleReset}
              >
                ↻ Refresh Page
              </button>
              <a
                href="/dashboard"
                className="btn btn-secondary error-boundary-link"
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
