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
    const updatedAvail = { ...availability, [key]: !availability[key] };
    setAvailability(updatedAvail);
  };

  const handleUpdateBio = (newBio) => {
    const updatedUser = { ...user, bio: newBio, onboardingCompleted: true };
    setUser(updatedUser);
    localStorage.setItem('skillloop_user', JSON.stringify(updatedUser));
  };

  const handleUpdateTeachSkills = (newTeachSkills) => {
    const updatedUser = { ...user, teachSkills: newTeachSkills, onboardingCompleted: true };
    setUser(updatedUser);
    localStorage.setItem('skillloop_user', JSON.stringify(updatedUser));
  };

  const handleUpdateLearnSkills = (newLearnSkills) => {
    const updatedUser = { ...user, learnSkills: newLearnSkills, onboardingCompleted: true };
    setUser(updatedUser);
    localStorage.setItem('skillloop_user', JSON.stringify(updatedUser));
  };

  const handleSaveModalData = (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields, onboardingCompleted: true };
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
            </div>

            {savedSuccess && (
              <div className="onboarding-error-banner profile-save-banner">
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
                setBio={handleUpdateBio}
                availability={availability}
                toggleAvailability={toggleAvailability}
                profileStrength={85}
              />

              {/* Component 3: Skills Editor */}
              <ProfileSkillsTagsCard
                teachSkills={user.teachSkills}
                setTeachSkills={handleUpdateTeachSkills}
                learnSkills={user.learnSkills}
                setLearnSkills={handleUpdateLearnSkills}
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
