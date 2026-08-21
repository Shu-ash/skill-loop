// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import ProfileHeaderCard from '../components/ProfileHeaderCard';
import ProfileDetailsEditor from '../components/ProfileDetailsEditor';
import ProfileSkillsTagsCard from '../components/ProfileSkillsTagsCard';
import EditProfileModal from '../components/EditProfileModal';

// ProfilePage: Main user profile page to view and update bio, availability & skill tags
export default function ProfilePage() {
  const [user, setUser] = useState({
    name: 'Harsh',
    username: '@harsh_dev',
    headline: 'Frontend developer & UI enthusiast who plays too much guitar 🎸',
    bio: "I've been building React & web apps for 3 years. Happy to trade knowledge with anyone who can help me learn Photoshop or UI animation!",
    rating: '4.9',
    credits: 3,
    teachSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
    learnSkills: ['Photoshop', 'Figma', 'UI Animation']
  });

  const [availability, setAvailability] = useState({
    weekdayEvenings: true,
    weekendMornings: false
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Read local user profile if available
    const stored = localStorage.getItem('skillloop_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          username: parsed.username || prev.username,
          headline: parsed.headline || prev.headline,
          bio: parsed.bio || prev.bio,
          teachSkills: parsed.teachSkills?.length ? parsed.teachSkills : prev.teachSkills,
          learnSkills: parsed.learnSkills?.length ? parsed.learnSkills : prev.learnSkills,
          credits: parsed.credits || prev.credits
        }));
      } catch (e) {
        console.error('Error parsing profile:', e);
      }
    }
  }, []);

  const toggleAvailability = (key) => {
    setAvailability((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveChanges = () => {
    const updatedUser = { ...user, onboardingCompleted: true };
    localStorage.setItem('skillloop_user', JSON.stringify(updatedUser));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveModalData = (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    localStorage.setItem('skillloop_user', JSON.stringify(updatedUser));
    setIsEditModalOpen(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
          <Sidebar user={{ name: user.name, credits: user.credits, avatar: user.name.slice(0, 2).toUpperCase() }} />

          <main className="main-content">
            <div className="page-title-row">
              <div>
                <h2>My Profile &amp; Skills</h2>
                <p>This is what other members see when they find you on SkillLoop.</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={handleSaveChanges}>
                Save changes
              </button>
            </div>

            {savedSuccess && (
              <div className="onboarding-error-banner" style={{ background: 'var(--mint-subtle)', color: 'var(--mint-primary)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                ✓ Profile changes saved successfully!
              </div>
            )}

            {/* Component 1: Header Profile Card */}
            <ProfileHeaderCard 
              user={user} 
              onEditCover={() => alert('Change cover photo clicked')} 
              onEditProfile={() => setIsEditModalOpen(true)}
            />

            {/* Grid layout for Profile Editors */}
            <div className="profile-editors-grid">
              {/* Component 2: About & Availability */}
              <ProfileDetailsEditor
                bio={user.bio}
                setBio={(bio) => setUser({ ...user, bio })}
                availability={availability}
                toggleAvailability={toggleAvailability}
                profileStrength={85}
              />

              {/* Component 3: Skills Editor */}
              <ProfileSkillsTagsCard
                teachSkills={user.teachSkills}
                setTeachSkills={(teachSkills) => setUser({ ...user, teachSkills })}
                learnSkills={user.learnSkills}
                setLearnSkills={(learnSkills) => setUser({ ...user, learnSkills })}
              />
            </div>
          </main>
        </div>

        {/* Modal for editing profile details */}
        {isEditModalOpen && (
          <EditProfileModal
            user={user}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveModalData}
          />
        )}

        <MobileNav />
      </div>
    </>
  );
}

