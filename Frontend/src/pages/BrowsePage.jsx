// src/pages/BrowsePage.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import BrowseSearch from '../components/BrowseSearch';
import MemberCard from '../components/MemberCard';

// Sample member data
const MEMBERS_DATA = [
  { id: "mbr_301", name: "Sara Park", avatar: "SP", avatarBg: "var(--violet-primary)", title: "UI Animation · San Diego", rating: "★★★★★", skills: ["Figma", "After Effects"], category: "Design" },
  { id: "mbr_302", name: "Theo Nakamura", avatar: "TN", avatarBg: "var(--gold-primary)", title: "Piano Basics · Remote", rating: "★★★★★", skills: ["Piano", "Music Theory"], category: "Music" },
  { id: "mbr_303", name: "Riya Anand", avatar: "RA", avatarBg: "var(--mint-primary)", title: "Python for Beginners · Remote", rating: "★★★★☆", skills: ["Python", "Pandas"], category: "Code & Data" },
  { id: "mbr_304", name: "Lena Kim", avatar: "LK", avatarBg: "var(--coral-primary)", title: "Conversational Spanish · Austin", rating: "★★★★★", skills: ["Spanish", "Travel Prep"], category: "Languages" },
  { id: "mbr_305", name: "Marcus Johnson", avatar: "MJ", avatarBg: "var(--deep-violet)", title: "Sourdough Baking · Seattle", rating: "★★★★★", skills: ["Baking", "Cooking"], category: "Cooking" }
];

export default function BrowsePage() {
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter members by category and search
  const filteredMembers = MEMBERS_DATA.filter((m) => {
    const matchesCategory = selectedCategory === 'All categories' || m.category === selectedCategory;
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