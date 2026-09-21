// src/pages/ReviewsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import SkillLoopLoader from '../components/SkillLoopLoader';
import './ReviewsPage.css';

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
          className={i <= rounded ? 'star-active' : 'star-muted'}
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
              <div className="glass-panel onboarding-error-banner">
                {error}
              </div>
            )}

            {/* Overview Summary Card */}
            <div className="glass-panel reviews-summary-card clay-card-3d">
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
                        title={`Filter by ${stars} stars (${count})`}
                      >
                        <span className="reviews-bar-label">{stars} ★</span>
                        <div className="reviews-bar-track">
                          <div
                            className={`reviews-bar-fill ${stars >= 4 ? 'bar-green' : stars === 3 ? 'bar-amber' : 'bar-red'}`}
                            style={{ width: `${percent}%` }}
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
            <div className="reviews-filter-pills-row">
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
              <SkillLoopLoader
                title="Loading Member Reviews"
                subtitle="Fetching verified peer feedback & rating distribution from MongoDB..."
                badgeText="MongoDB Live Sync"
                variant="card"
              />
            ) : totalReviews === 0 ? (
              /* Completely Empty State */
              <div className="glass-panel empty-requests-card empty-reviews-box">
                <div className="empty-reviews-icon">⭐</div>
                <h3 className="empty-reviews-title">
                  No Reviews Received Yet
                </h3>
                <p className="empty-reviews-desc">
                  You haven't received any reviews yet. Complete skill swap sessions as a mentor or peer to earn verified feedback and build your SkillLoop reputation!
                </p>
                <div className="empty-action-btns-row">
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
              <div className="glass-panel empty-requests-card empty-reviews-box-sm">
                <p className="empty-reviews-desc">
                  No {selectedFilter}-star reviews found.
                </p>
                <button type="button" className="btn btn-secondary btn-pill-sm" onClick={() => setSelectedFilter('all')}>
                  View All Reviews
                </button>
              </div>
            ) : (
              /* List of Reviews */
              <div className="reviews-card-list">
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
                    >
                      {/* Review Top Row: Reviewer + Stars + Date */}
                      <div className="review-top-row">
                        <div className="review-author-group">
                          <div className="user-avatar review-author-avatar">
                            {reviewer?.profilePhotoUrl ? (
                              <img
                                src={reviewer.profilePhotoUrl}
                                alt={reviewerName}
                                className="review-avatar-img"
                              />
                            ) : (
                              reviewerInitials
                            )}
                          </div>
                          <div>
                            <h4 className="review-author-name">
                              {reviewerName}
                            </h4>
                            {reviewer?.headline && (
                              <p className="review-author-headline">
                                {reviewer.headline}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="review-rating-group">
                          <div className="review-rating-value">
                            ★ {Number(rev.rating).toFixed(1)}
                          </div>
                          <span className="review-date-text">
                            {formatReviewDate(rev.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Context Badges: Skill Topic & Role */}
                      <div className="review-badges-row">
                        <span className="pill-badge pill-violet pill-compact">
                          📚 {skillTitle}
                        </span>
                        <span className="pill-badge pill-mint pill-compact">
                          {rev.role === 'teacher' ? '🎓 Learner review' : '🤝 Peer swap review'}
                        </span>
                      </div>

                      {/* Comment text */}
                      <div className={`review-comment-box ${!rev.comment ? 'italic' : ''}`}>
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
