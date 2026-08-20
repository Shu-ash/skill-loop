import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BrowsePage from './pages/BrowsePage';
import './index.css';
// will add other pages here when they are ready:
// import BrowsePage from './pages/BrowsePage';
// import LoginPage from './pages/LoginPage';

function App() {
  return (
    <div id="app">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/browse" element={<BrowsePage />} />

        {/* Will add these routes when the pages are ready */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
      </Routes>
    </div>
  );
}

export default App;