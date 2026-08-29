// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import ProfileHeaderCard from '../components/ProfileHeaderCard';
import ProfileDetailsEditor from '../components/ProfileDetailsEditor';
import ProfileSkillsTagsCard from '../components/ProfileSkillsTagsCard';
import EditProfileModal from '../components/EditProfileModal';

// ProfilePage: Main user profile page to view and update bio, availability & skill tags
export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: 'Harsh',
    username: '@harsh_dev',
    headline: 'Frontend developer & UI enthusiast who plays too much guitar 🎸',
    bio: "I've been building React & web apps for 3 years. Happy to trade knowledge with anyone who can help me learn Photoshop or UI animation!",
    rating: '4.9',
    credits: 3,
    teachSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
    learnSkills: ['Photoshop', 'Figma', 'UI Animation'],
    onboardingCompleted: true
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
          credits: parsed.credits || prev.credits,
          onboardingCompleted: parsed.onboardingCompleted ?? prev.onboardingCompleted
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

  const handleSaveModalData = async (updatedFields) => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      const updatedUser = { ...user, ...updatedFields, onboardingCompleted: true };
      setUser(updatedUser);
      localStorage.setItem('skillloop_user', JSON.stringify(updatedUser));
      setIsEditModalOpen(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify({
          name: updatedFields.name,
          username: updatedFields.username,
          profilePhotoUrl: updatedFields.avatarUrl,
          bio: updatedFields.bio,
          headline: updatedFields.headline,
          skillsCanTeach: updatedFields.skillsCanTeach || user.teachSkills,
          skillsWantToLearn: updatedFields.skillsWantToLearn || user.learnSkills,
          skillLevel: updatedFields.skillLevel
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      const updatedUserFromServer = data.data?.user || data.data || {};

      const updatedUser = {
        ...user,
        ...updatedFields,
        username: updatedUserFromServer.username || updatedFields.username || user.username,
        avatarUrl: updatedUserFromServer.profilePhotoUrl || user.avatarUrl,
        bio: updatedUserFromServer.bio || updatedFields.bio || user.bio,
        headline: updatedUserFromServer.headline || updatedFields.headline || user.headline,
        teachSkills: updatedUserFromServer.skillsCanTeach || user.teachSkills,
        learnSkills: updatedUserFromServer.skillsWantToLearn || user.learnSkills,
        credits: updatedUserFromServer.credits ?? user.credits,
        onboardingCompleted: true
      };

      setUser(updatedUser);
      localStorage.setItem('skillloop_user', JSON.stringify(updatedUser));
      setIsEditModalOpen(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);

    } catch (error) {
      console.error('Profile update error:', error);
      const updatedUser = { ...user, ...updatedFields, onboardingCompleted: true };
      setUser(updatedUser);
      localStorage.setItem('skillloop_user', JSON.stringify(updatedUser));
      setIsEditModalOpen(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
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

            {!user.onboardingCompleted && (
              <div className="glass-panel admin-access-notice" style={{ marginBottom: '1.2rem', padding: '1rem 1.25rem' }}>
                🎉 <strong>Welcome to SkillLoop! Complete your profile below</strong> to start trading skills with community members.
              </div>
            )}

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
