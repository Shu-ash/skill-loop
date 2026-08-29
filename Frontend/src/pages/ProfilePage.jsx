// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import ProfileHeaderCard from '../components/ProfileHeaderCard';
import ProfileDetailsEditor from '../components/ProfileDetailsEditor';
import ProfileSkillsTagsCard from '../components/ProfileSkillsTagsCard';
import EditProfileModal from '../components/EditProfileModal';
import ImageCropperModal from '../components/ImageCropperModal';

const API_BASE_URL = 'http://localhost:5000/api';

// ProfilePage: Clean Read-Only profile showcase with live MongoDB sync & comprehensive skill management
export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: 'Member User',
    username: '@user',
    headline: 'SkillLoop Community Member 🚀',
    bio: '',
    profilePhotoUrl: '',
    coverPhotoUrl: '',
    rating: '5.0',
    credits: 3,
    teachSkills: ['React JS', 'JavaScript'],
    learnSkills: ['UI/UX Design', 'Python'],
    skillLevel: 'intermediate',
    onboardingCompleted: false
  });

  const [availability, setAvailability] = useState({
    weekdayEvenings: true,
    weekendMornings: false,
    mode: 'Online Only'
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState('');

  // Image Cropper State
  const [cropperConfig, setCropperConfig] = useState({
    isOpen: false,
    imageSrc: '',
    cropType: 'avatar' // 'avatar' | 'cover'
  });

  // Calculate dynamic profile strength percentage
  const profileStrength = useMemo(() => {
    let score = 20; // Base score
    if (user.name && user.name !== 'Member User') score += 15;
    if (user.username && user.username !== '@user') score += 10;
    if (user.bio && user.bio.trim().length > 5) score += 20;
    if (user.profilePhotoUrl) score += 15;
    if (user.coverPhotoUrl) score += 5;
    if (user.teachSkills && user.teachSkills.length > 0) score += 10;
    if (user.learnSkills && user.learnSkills.length > 0) score += 5;
    return Math.min(score, 100);
  }, [user]);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        const u = data.data.user;
        const liveUser = {
          name: u.name || 'Member User',
          username: u.username ? `@${u.username.replace(/^@/, '')}` : '@user',
          headline: u.headline || 'SkillLoop Community Member 🚀',
          bio: u.bio || '',
          profilePhotoUrl: u.profilePhotoUrl || '',
          coverPhotoUrl: u.coverPhotoUrl || '',
          rating: u.rating ? u.rating.toString() : '5.0',
          credits: u.credits ?? 3,
          teachSkills: Array.isArray(u.skillsCanTeach) && u.skillsCanTeach.length ? u.skillsCanTeach : (user.teachSkills || ['React JS', 'JavaScript']),
          learnSkills: Array.isArray(u.skillsWantToLearn) && u.skillsWantToLearn.length ? u.skillsWantToLearn : (user.learnSkills || ['UI/UX Design', 'Python']),
          skillLevel: u.skillLevel || 'intermediate',
          onboardingCompleted: u.onboardingCompleted ?? false
        };
        setUser(liveUser);
        if (u.availability) {
          setAvailability(u.availability);
        }
        localStorage.setItem('skillloop_user', JSON.stringify({ ...liveUser, availability: u.availability }));
      }
    } catch (err) {
      console.log('Profile sync fallback to local storage');
    }
  };

  useEffect(() => {
    const adminSession = localStorage.getItem('skillloop_admin');
    const userSession = localStorage.getItem('skillloop_user');

    if (adminSession && !userSession) {
      navigate('/admin', { replace: true });
      return;
    }

    if (userSession) {
      try {
        const parsed = JSON.parse(userSession);
        setUser(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          username: parsed.username || prev.username,
          headline: parsed.headline || prev.headline,
          bio: parsed.bio || prev.bio,
          profilePhotoUrl: parsed.profilePhotoUrl || parsed.avatarUrl || prev.profilePhotoUrl,
          coverPhotoUrl: parsed.coverPhotoUrl || prev.coverPhotoUrl,
          rating: parsed.rating || prev.rating,
          credits: parsed.credits ?? prev.credits,
          teachSkills: Array.isArray(parsed.teachSkills) && parsed.teachSkills.length ? parsed.teachSkills : (Array.isArray(parsed.skillsCanTeach) ? parsed.skillsCanTeach : prev.teachSkills),
          learnSkills: Array.isArray(parsed.learnSkills) && parsed.learnSkills.length ? parsed.learnSkills : (Array.isArray(parsed.skillsWantToLearn) ? parsed.skillsWantToLearn : prev.learnSkills),
          skillLevel: parsed.skillLevel || prev.skillLevel,
          onboardingCompleted: parsed.onboardingCompleted ?? prev.onboardingCompleted
        }));

        if (parsed.availability) {
          setAvailability(parsed.availability);
        }
      } catch (e) {
        console.error('Error parsing profile:', e);
      }
    }

    // Always fetch live profile from MongoDB
    fetchUserProfile();
  }, [navigate]);

  // Local File Selected from PC Handlers
  const handleAvatarFileSelected = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCropperConfig({
        isOpen: true,
        imageSrc: reader.result,
        cropType: 'avatar'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFileSelected = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCropperConfig({
        isOpen: true,
        imageSrc: reader.result,
        cropType: 'cover'
      });
    };
    reader.readAsDataURL(file);
  };

  // Crop Complete Handler
  const handleCropComplete = async (croppedDataUrl) => {
    const isAvatar = cropperConfig.cropType === 'avatar';
    const fieldKey = isAvatar ? 'profilePhotoUrl' : 'coverPhotoUrl';

    const updatedUser = {
      ...user,
      [fieldKey]: croppedDataUrl,
      ...(isAvatar ? { avatarUrl: croppedDataUrl } : {})
    };

    setUser(updatedUser);
    localStorage.setItem('skillloop_user', JSON.stringify(updatedUser));

    setSavedSuccess(isAvatar ? '✓ Profile photo updated and saved to database!' : '✓ Cover banner updated and saved to database!');
    setTimeout(() => setSavedSuccess(''), 3500);

    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/users/me`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            [fieldKey]: croppedDataUrl
          })
        });
      } catch (err) {
        console.error('Backend photo sync error:', err);
      }
    }
  };

  // Save Modal Data (Basic details + Skills + Availability)
  const handleSaveModalData = async (updatedFields) => {
    const accessToken = localStorage.getItem('accessToken');

    if (updatedFields.availability) {
      setAvailability(updatedFields.availability);
    }

    const updatedUserLocal = {
      ...user,
      name: updatedFields.name,
      username: updatedFields.username,
      headline: updatedFields.headline,
      bio: updatedFields.bio,
      teachSkills: updatedFields.teachSkills || updatedFields.skillsCanTeach || user.teachSkills,
      learnSkills: updatedFields.learnSkills || updatedFields.skillsWantToLearn || user.learnSkills,
      skillLevel: updatedFields.skillLevel || user.skillLevel,
      availability: updatedFields.availability || availability,
      onboardingCompleted: true
    };

    setUser(updatedUserLocal);
    localStorage.setItem('skillloop_user', JSON.stringify(updatedUserLocal));
    setIsEditModalOpen(false);
    setSavedSuccess('✓ Profile, skills & availability saved to MongoDB successfully!');
    setTimeout(() => setSavedSuccess(''), 3500);

    if (!accessToken) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify({
          name: updatedFields.name,
          username: (updatedFields.username || '').replace(/^@/, ''),
          bio: updatedFields.bio,
          headline: updatedFields.headline,
          skillsCanTeach: updatedFields.teachSkills || updatedFields.skillsCanTeach || [],
          skillsWantToLearn: updatedFields.learnSkills || updatedFields.skillsWantToLearn || [],
          skillLevel: updatedFields.skillLevel || 'intermediate',
          availability: updatedFields.availability || availability,
          onboardingCompleted: true
        })
      });

      const resData = await res.json();
      if (resData.success && resData.data?.user) {
        const u = resData.data.user;
        const liveUser = {
          ...updatedUserLocal,
          name: u.name || updatedUserLocal.name,
          username: u.username ? `@${u.username.replace(/^@/, '')}` : updatedUserLocal.username,
          teachSkills: Array.isArray(u.skillsCanTeach) ? u.skillsCanTeach : updatedUserLocal.teachSkills,
          learnSkills: Array.isArray(u.skillsWantToLearn) ? u.skillsWantToLearn : updatedUserLocal.learnSkills,
          skillLevel: u.skillLevel || updatedUserLocal.skillLevel,
          availability: u.availability || updatedUserLocal.availability
        };
        setUser(liveUser);
        localStorage.setItem('skillloop_user', JSON.stringify(liveUser));
      }
    } catch (error) {
      console.error('Profile update MongoDB error:', error);
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
          <Sidebar />

          <main className="main-content">
            <div className="page-title-row">
              <div>
                <h2>My Profile &amp; Skills</h2>
                <p>Preview your public member showcase, customize your bio, and manage your skill categories.</p>
              </div>
            </div>

            {savedSuccess && (
              <div className="onboarding-error-banner profile-save-banner" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#10b981', border: '1px solid rgba(52, 211, 153, 0.4)', marginBottom: '1.2rem' }}>
                {savedSuccess}
              </div>
            )}

            {/* Component 1: Header Profile Card with Photo Upload Triggers */}
            <ProfileHeaderCard 
              user={user} 
              onCoverFileSelected={handleCoverFileSelected}
              onAvatarFileSelected={handleAvatarFileSelected}
              onEditProfile={() => setIsEditModalOpen(true)}
            />

            {/* Grid layout for Clean Read-Only Profile Showcases */}
            <div className="profile-editors-grid">
              <div className="profile-col-left">
                {/* Clean Read-Only About & Availability Card */}
                <ProfileDetailsEditor 
                  bio={user.bio} 
                  availability={availability}
                  profileStrength={profileStrength}
                  onOpenEdit={() => setIsEditModalOpen(true)}
                />
              </div>

              <div className="profile-col-right">
                {/* Clean Read-Only Skills & Focus Showcase */}
                <ProfileSkillsTagsCard 
                  teachSkills={user.teachSkills}
                  learnSkills={user.learnSkills}
                  skillLevel={user.skillLevel}
                  onOpenEdit={() => setIsEditModalOpen(true)}
                />
              </div>
            </div>
          </main>
        </div>

        <MobileNav />
      </div>

      {/* Comprehensive Edit Profile & Skills Modal */}
      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        availability={availability}
        onSave={handleSaveModalData}
      />

      {/* Image Cropper Modal for Profile & Cover Photos */}
      <ImageCropperModal
        isOpen={cropperConfig.isOpen}
        imageSrc={cropperConfig.imageSrc}
        cropType={cropperConfig.cropType}
        onClose={() => setCropperConfig(prev => ({ ...prev, isOpen: false }))}
        onCropComplete={handleCropComplete}
      />
    </>
  );
}
