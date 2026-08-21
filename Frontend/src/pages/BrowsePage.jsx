// src/pages/BrowsePage.jsx

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import BrowseSearch from '../components/BrowseSearch';
import MemberCard from '../components/MemberCard';

// Sample member data
const MEMBERS_DATA = [
  { id: "mbr_301", name: "Harsh Vishwakarma", avatar: "HV", avatarBg: "var(--violet-primary)", title: "Frontend Developer - Remote", rating: "★★★★★", skills: ["Frontend Developer", "Video Editing"], categories: ["Design", "Code & Data"] },
  { id: "mbr_302", name: "Sujit Bauna", avatar: "SS", avatarBg: "var(--gold-primary)", title: "AI Specialist · Remote", rating: "★★★★★", skills: ["AI user", "Backend Developer"], categories: ["Code & Data"] },
  { id: "mbr_303", name: "Debosmita Laha", avatar: "DL", avatarBg: "var(--mint-primary)", title: "Python for Beginners · Remote", rating: "★★★★☆", skills: ["Python", "Pandas"], categories: ["Code & Data"] },
  { id: "mbr_304", name: "Milon Hackathon", avatar: "MH", avatarBg: "var(--coral-primary)", title: "Mongo DB & Express.js · Remote", rating: "★★★★★", skills: ["Mongo DB", "Express.js"], categories: ["Code & Data"] },
  { id: "mbr_305", name: "Sample 1", avatar: "S", avatarBg: "var(--deep-violet)", title: "Test Sample - Under development", rating: "★★★★★", skills: ["Conversation", "English"], categories: ["Languages"] }
];

export default function BrowsePage() {
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter members by category and search
  const filteredMembers = MEMBERS_DATA.filter((m) => {
    const matchesCategory = selectedCategory === 'All categories' || m.categories.includes(selectedCategory);
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(searchLower) ||
      m.title.toLowerCase().includes(searchLower) ||
      m.skills.some(s => s.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Background animation */}
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
                <h2>Browse the loop</h2>
                <p>2,140 members ready to trade knowledge.</p>
              </div>
            </div>

            {/* Search and filters */}
            <BrowseSearch 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            {/* Member cards */}
            <div className="browse-grid">
              {filteredMembers.length > 0 ? (
                filteredMembers.map(member => (
                  <MemberCard key={member.id} member={member} />
                ))
              ) : (
                <div style={{ padding: '2rem', color: 'var(--slate-500)' }}>
                  No members found.
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Mobile navigation */}
        <MobileNav />
      </div>
    </>
  );
}