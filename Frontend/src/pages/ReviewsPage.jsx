// src/pages/ReviewsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

const API_BASE_URL = 'http://localhost:5000/api';

export default function ReviewsPage() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(5.0);
  const [distribution, setDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          credentials: 'include'
        });

        const data = await response.json();

        if (response.ok && data.success && data.data) {
          setReviews(data.data.reviews || []);
          setTotalReviews(data.data.totalReviews || 0);
          setAverageRating(data.data.averageRating ?? 5.0);
          setDistribution(data.data.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
        } else {
          setError(data.message || 'Failed to load your reviews');
        }
      } catch (err) {
        console.error('Error fetching received reviews:', err);
        setError('Network error while loading reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [navigate]);

  const filteredReviews = useMemo(() => {
    if (selectedFilter === 'all') return reviews;
    const targetRating = Number(selectedFilter);
    return reviews.filter((r) => Math.round(r.rating) === targetRating);
  }, [reviews, selectedFilter]);

  const positivePercent = useMemo(() => {
    if (totalReviews === 0) return 100;
    const highRatings = (distribution[5] || 0) + (distribution[4] || 0);
    return Math.round((highRatings / totalReviews) * 100);
  }, [distribution, totalReviews]);

  const renderStars = (rating) => {
    const stars = [];
    const rounded = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= rounded ? '#f59e0b' : '#cbd5e1',
            fontSize: '1.25rem',
            marginRight: '2px'
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const formatReviewDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getReviewerInitials = (reviewer) => {
    if (!reviewer) return 'M';
    const name =
      reviewer.name ||
      `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim() ||
      reviewer.username ||
      'Member';
    return name
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getReviewerName = (reviewer) => {
    if (!reviewer) return 'SkillLoop Member';
    return (
      reviewer.name ||
      `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim() ||
      reviewer.username ||
      'SkillLoop Member'
    );
  };

  return (
    <>
      <div className="liquid-bg">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
      </div>

      <div id="app">
        <Navbar />

        <div className="app-layout">
          <Sidebar />

          <main className="main-content">
            <div className="page-title-row">
              <div>
                <h2>My Reviews &amp; Feedback</h2>
                <p>Ratings and testimonials received from learners and peers after completed swap sessions.</p>
              </div>
            </div>

            {error && (
              <div className="glass-panel onboarding-error-banner" style={{ marginBottom: '1.5rem' }}>
                {error}
              </div>
            )}

            {/* Overview Summary Card */}
            <div className="glass-panel reviews-summary-card clay-card-3d" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
              <div className="reviews-summary-grid">
                {/* Left: Rating Score */}
                <div className="reviews-score-col">
                  <div className="reviews-score-number">
                    {totalReviews > 0 ? Number(averageRating).toFixed(1) : '5.0'}
                  </div>
                  <div className="reviews-stars-row">
                    {renderStars(totalReviews > 0 ? averageRating : 5)}
                  </div>
                  <p className="reviews-total-text">
                    {totalReviews === 1
                      ? 'Based on 1 verified review'
                      : `Based on ${totalReviews} verified reviews`}
                  </p>
                  <span className="reviews-positive-badge">
                    👍 {positivePercent}% Positive satisfaction
                  </span>
                </div>

                {/* Right: Distribution Bars */}
                <div className="reviews-bars-col">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = distribution[stars] || 0;
                    const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                    return (
                      <div
                        key={stars}
                        className="reviews-bar-row"
                        onClick={() => setSelectedFilter(selectedFilter === String(stars) ? 'all' : String(stars))}
                        style={{ cursor: 'pointer' }}
                        title={`Filter by ${stars} stars (${count})`}
                      >
                        <span className="reviews-bar-label">{stars} ★</span>
                        <div className="reviews-bar-track">
                          <div
                            className="reviews-bar-fill"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: stars >= 4 ? '#10b981' : stars === 3 ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </div>
                        <span className="reviews-bar-count">
                          {count} ({percent}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="reviews-filter-pills-row" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <button
                type="button"
                className={`btn btn-pill-sm ${selectedFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedFilter('all')}
              >
                All Reviews ({totalReviews})
              </button>
              {[5, 4, 3, 2, 1].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`btn btn-pill-sm ${selectedFilter === String(s) ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedFilter(String(s))}
                >
                  {s} ★ ({distribution[s] || 0})
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="glass-panel empty-requests-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <p>Loading your reviews...</p>
              </div>
            ) : totalReviews === 0 ? (
              /* Completely Empty State */
              <div className="glass-panel empty-requests-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--slate-800)' }}>
                  No Reviews Received Yet
                </h3>
                <p style={{ color: 'var(--slate-500)', maxWidth: '460px', margin: '0 auto 1.75rem', lineHeight: '1.6' }}>
                  You haven't received any reviews yet. Complete skill swap sessions as a mentor or peer to earn verified feedback and build your SkillLoop reputation!
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-primary" onClick={() => navigate('/sessions')}>
                    📅 View My Sessions
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => navigate('/browse')}>
                    🔍 Browse Skills
                  </button>
                </div>
              </div>
            ) : filteredReviews.length === 0 ? (
              /* Filtered to 0 State */
              <div className="glass-panel empty-requests-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <p style={{ color: 'var(--slate-500)', marginBottom: '1rem' }}>
                  No {selectedFilter}-star reviews found.
                </p>
                <button type="button" className="btn btn-secondary btn-pill-sm" onClick={() => setSelectedFilter('all')}>
                  View All Reviews
                </button>
              </div>
            ) : (
              /* List of Reviews */
              <div className="reviews-card-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredReviews.map((rev) => {
                  const reviewer = rev.reviewer;
                  const reviewerName = getReviewerName(reviewer);
                  const reviewerInitials = getReviewerInitials(reviewer);
                  const session = rev.session;
                  const skillTitle = rev.skill || session?.skill || session?.topic || 'Skill Swap';

                  return (
                    <div
                      key={rev._id}
                      className="glass-panel review-card-item clay-card-3d"
                      style={{
                        padding: '1.25rem 1.5rem',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      {/* Review Top Row: Reviewer + Stars + Date */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.75rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            className="user-avatar"
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              background: 'var(--violet-primary)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '1rem',
                              flexShrink: 0,
                              overflow: 'hidden'
                            }}
                          >
                            {reviewer?.profilePhotoUrl ? (
                              <img
                                src={reviewer.profilePhotoUrl}
                                alt={reviewerName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              reviewerInitials
                            )}
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--slate-800)' }}>
                              {reviewerName}
                            </h4>
                            {reviewer?.headline && (
                              <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                                {reviewer.headline}
                              </p>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: '700' }}>
                              ★ {Number(rev.rating).toFixed(1)}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.82rem', color: 'var(--slate-400)' }}>
                            {formatReviewDate(rev.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Context Badges: Skill Topic & Role */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span
                          className="pill-badge pill-violet"
                          style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}
                        >
                          📚 {skillTitle}
                        </span>
                        <span
                          className="pill-badge pill-mint"
                          style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}
                        >
                          {rev.role === 'teacher' ? '🎓 Learner review' : '🤝 Peer swap review'}
                        </span>
                      </div>

                      {/* Comment text */}
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.5)',
                          padding: '0.85rem 1rem',
                          borderRadius: '12px',
                          border: '1px solid rgba(226, 232, 240, 0.6)',
                          color: rev.comment ? 'var(--slate-700)' : 'var(--slate-400)',
                          fontSize: '0.92rem',
                          lineHeight: '1.5',
                          fontStyle: rev.comment ? 'normal' : 'italic'
                        }}
                      >
                        {rev.comment ? `"${rev.comment}"` : 'Member left a star rating without written feedback.'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>

        <MobileNav />
      </div>
    </>
  );
}
