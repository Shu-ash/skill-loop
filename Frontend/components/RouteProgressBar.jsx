// src/components/RouteProgressBar.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './RouteProgressBar.css';

/**
 * RouteProgressBar: Top-of-page glowing gradient progress indicator
 * Automatically triggers whenever the active route or search params change.
 */
export default function RouteProgressBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reset and trigger smooth sweep on route change
    setVisible(true);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(72), 90);
    const t2 = setTimeout(() => setProgress(94), 220);
    const t3 = setTimeout(() => setProgress(100), 360);
    const t4 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 550);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [location.pathname, location.search]);

  if (!visible && progress === 0) return null;

  return (
    <div className={`route-progress-wrapper ${visible ? 'is-visible' : 'is-hidden'}`} aria-hidden="true">
      <div className={`route-progress-bar progress-${progress}`}>
        <div className="route-progress-glow" />
      </div>
    </div>
  );
}
