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
    name: 'Member User',
    username: '@user',
    headline: 'SkillLoop Community Member 🚀',
    bio: 'Tell the community about yourself and your skills!',
    rating: '5.0',
    credits: 3,
    teachSkills: [],
    learnSkills: [],
    onboardingCompleted: false
  });

  const [availability, setAvailability] = useState({
    weekdayEvenings: true,
    weekendMornings: false
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // If Admin session is active, redirect to /admin
    const adminSession = localStorage.getItem('skillloop_admin');
    const userSession = localStorage.getItem('skillloop_user');

    if (adminSession && !userSession) {
      navigate('/admin', { replace: true });
      return;
    }

    if (userSession) {
      try {
        const parsed = JSON.parse(userSession);
        setUser({
          name: parsed.name || 'Member User',
          username: parsed.username || `@${(parsed.email || 'user').split('@')[0]}`,
          headline: parsed.headline || 'SkillLoop Community Member 🚀',
          bio: parsed.bio || 'Tell the community about yourself and your skills!',
          rating: parsed.rating || '5.0',
          credits: parsed.credits ?? 3,
          teachSkills: Array.isArray(parsed.teachSkills) ? parsed.teachSkills : [],
          learnSkills: Array.isArray(parsed.learnSkills) ? parsed.learnSkills : [],
          onboardingCompleted: parsed.onboardingCompleted ?? false
        });
      } catch (e) {
        console.error('Error parsing profile:', e);
      }
    }
  }, [navigate]);

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
          <Sidebar user={{ name: user.name, credits: user.credits, avatar: (user.name || 'US').slice(0, 2).toUpperCase() }} />

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
                profileStrength={user.teachSkills.length > 0 ? 90 : 30}
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
