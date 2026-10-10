// src/components/MobileNav.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function MobileNav() {
  const location = useLocation();

  return (

    //Mobile bottom navigation bar for mobile view
    <nav className="mobile-bottom-nav">
      <Link className={`mobile-nav-btn ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard">
        <span>🏠</span> Home
      </Link>
      <Link className={`mobile-nav-btn ${location.pathname === '/browse' ? 'active' : ''}`} to="/browse">
        <span>🔍</span> Browse
      </Link>
      <Link className={`mobile-nav-btn ${location.pathname === '/requests' ? 'active' : ''}`} to="/requests">
        <span>📥</span> Requests
      </Link>
      <Link className={`mobile-nav-btn ${location.pathname === '/credits' ? 'active' : ''}`} to="/credits">
        <span>🪙</span> Credits
      </Link>
      <Link className={`mobile-nav-btn ${location.pathname === '/profile' ? 'active' : ''}`} to="/profile">
        <span>👤</span> Profile
      </Link>
    </nav>
  );
}