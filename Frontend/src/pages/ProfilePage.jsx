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
import ChangePasswordModal from '../components/ChangePasswordModal';

const API_BASE_URL = 'http://localhost:5000/api';

// ProfilePage: Clean Read-Only profile showcase with live MongoDB sync & 2-column layout
export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const userSession = localStorage.getItem('skillloop_user');
    if (userSession) {
      try {
        const parsed = JSON.parse(userSession);
        return {
          name: parsed.name || 'Member',
          username: parsed.username ? `@${parsed.username.replace(/^@/, '')}` : '@user',
          headline: parsed.headline || 'SkillLoop Community Member 🚀',
          bio: parsed.bio || '',
          profilePhotoUrl: parsed.profilePhotoUrl || '',
          coverPhotoUrl: parsed.coverPhotoUrl || '',
          rating: (parsed.rating || 0).toString(),
          ratingCount: parsed.ratingCount || 0,
          credits: parsed.credits ?? 10,
          teachSkills: Array.isArray(parsed.skillsCanTeach) ? parsed.skillsCanTeach : (Array.isArray(parsed.teachSkills) ? parsed.teachSkills : []),
          learnSkills: Array.isArray(parsed.skillsWantToLearn) ? parsed.skillsWantToLearn : (Array.isArray(parsed.learnSkills) ? parsed.learnSkills : []),
          skillLevel: parsed.skillLevel || 'beginner',
          onboardingCompleted: parsed.onboardingCompleted ?? false
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: 'Member',
      username: '@user',
      headline: 'SkillLoop Community Member 🚀',
      bio: '',
      profilePhotoUrl: '',
      coverPhotoUrl: '',
      rating: '0.0',
      ratingCount: 0,
      credits: 10,
      teachSkills: [],
      learnSkills: [],
      skillLevel: 'beginner',
      onboardingCompleted: false
    };
  });

  const [availability, setAvailability] = useState({
    weekdayEvenings: true,
    weekendMornings: false,
    mode: 'Online Only'
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState('');

  // Image Cropper State
  const [cropperConfig, setCropperConfig] = useState({
    isOpen: false,
    imageSrc: '',
    cropType: 'avatar' // 'avatar' | 'cover'
  });

  // Calculate dynamic profile strength percentage (0% to 100% based on real filled data)
  const profileStrength = useMemo(() => {
    let score = 0;
    if (user.name && user.name !== 'Member') score += 20;
    if (user.username && user.username !== '@user') score += 15;
    if (user.bio && user.bio.trim().length > 5) score += 20;
    if (user.profilePhotoUrl) score += 15;
    if (user.coverPhotoUrl) score += 10;
    if (user.teachSkills && user.teachSkills.length > 0) score += 10;
    if (user.learnSkills && user.learnSkills.length > 0) score += 10;
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
      if (res.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('skillloop_user');
        navigate('/login');
        return;
      }

      const data = await res.json();
      if (data.success && data.data?.user) {
        const u = data.data.user;
        const liveUser = {
          name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Member',
          username: u.username ? `@${u.username.replace(/^@/, '')}` : '@user',
          headline: u.headline || 'SkillLoop Community Member 🚀',
          bio: u.bio || '',
          profilePhotoUrl: u.profilePhotoUrl || '',
          coverPhotoUrl: u.coverPhotoUrl || '',
          rating: (u.rating || 0).toString(),
          ratingCount: u.ratingCount || 0,
          credits: u.credits ?? 10,
          teachSkills: Array.isArray(u.skillsCanTeach) ? u.skillsCanTeach : [],
          learnSkills: Array.isArray(u.skillsWantToLearn) ? u.skillsWantToLearn : [],
          skillLevel: u.skillLevel || 'beginner',
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

    fetchUserProfile();
  }, [navigate]);

  // Open file cropper
  const handleFileForCrop = (file, cropType) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropperConfig({
        isOpen: true,
        imageSrc: reader.result,
        cropType
      });
    };
    reader.readAsDataURL(file);
  };

  // Save cropped result (avatar or cover)
  const handleCropComplete = async (croppedBase64) => {
    setCropperConfig(prev => ({ ...prev, isOpen: false }));

    if (cropperConfig.cropType === 'avatar') {
      setUser(prev => ({ ...prev, profilePhotoUrl: croppedBase64 }));
      await saveProfileFieldToDB({ profilePhotoUrl: croppedBase64 });
    } else {
      setUser(prev => ({ ...prev, coverPhotoUrl: croppedBase64 }));
      await saveProfileFieldToDB({ coverPhotoUrl: croppedBase64 });
    }
  };

  // Helper to persist single fields to Backend MongoDB
  const saveProfileFieldToDB = async (updatePayload) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(updatePayload)
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        const u = data.data.user;
        const updatedLiveUser = {
          name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Member',
          username: u.username ? `@${u.username.replace(/^@/, '')}` : '@user',
          headline: u.headline || '',
          bio: u.bio || '',
          profilePhotoUrl: u.profilePhotoUrl || '',
          coverPhotoUrl: u.coverPhotoUrl || '',
          rating: (u.rating || 0).toString(),
          ratingCount: u.ratingCount || 0,
          credits: u.credits ?? 10,
          teachSkills: Array.isArray(u.skillsCanTeach) ? u.skillsCanTeach : [],
          learnSkills: Array.isArray(u.skillsWantToLearn) ? u.skillsWantToLearn : [],
          skillLevel: u.skillLevel || 'beginner',
          onboardingCompleted: u.onboardingCompleted ?? false
        };
        setUser(updatedLiveUser);
        localStorage.setItem('skillloop_user', JSON.stringify({ ...updatedLiveUser, availability: u.availability || availability }));
        setSavedSuccess('Profile updated successfully!');
        setTimeout(() => setSavedSuccess(''), 2500);
      }
    } catch (err) {
      console.error('Failed to save profile changes to DB:', err);
    }
  };

  // Save changes from EditProfileModal (including skills addition & removal)
  const handleSaveModalProfile = async (updatedData) => {
    const teachSkills = Array.isArray(updatedData.skillsCanTeach) ? updatedData.skillsCanTeach : [];
    const learnSkills = Array.isArray(updatedData.skillsWantToLearn) ? updatedData.skillsWantToLearn : [];

    setUser(prev => ({
      ...prev,
      name: updatedData.name,
      username: updatedData.username ? `@${updatedData.username.replace(/^@/, '')}` : prev.username,
      headline: updatedData.headline,
      bio: updatedData.bio,
      teachSkills,
      learnSkills,
      skillLevel: updatedData.skillLevel
    }));

    if (updatedData.availability) {
      setAvailability(updatedData.availability);
    }

    const payload = {
      name: updatedData.name,
      username: updatedData.username,
      headline: updatedData.headline,
      bio: updatedData.bio,
      skillsCanTeach: teachSkills,
      skillsWantToLearn: learnSkills,
      skillLevel: updatedData.skillLevel,
      availability: updatedData.availability
    };

    await saveProfileFieldToDB(payload);
    setIsEditModalOpen(false);
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

          <main className="main-content profile-page-content">
            <div className="page-title-row">
              <div>
                <h2>Your Profile</h2>
                <p>Manage your public appearance, teaching skills, password, and weekly swap availability.</p>
              </div>
            </div>

            {savedSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.88rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                ✓ {savedSuccess}
              </div>
            )}

            {/* Profile Header Hero Card */}
            <ProfileHeaderCard
              user={user}
              profileStrength={profileStrength}
              onOpenEditModal={() => setIsEditModalOpen(true)}
              onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
              onUploadAvatar={(file) => handleFileForCrop(file, 'avatar')}
              onUploadCover={(file) => handleFileForCrop(file, 'cover')}
            />

            {/* Side-by-Side 2-Column Editors Layout */}
            <div className="profile-editors-grid" style={{ marginTop: '1.5rem' }}>
              {/* Left Column: Read-Only Info & Availability */}
              <div className="profile-editors-left">
                <ProfileDetailsEditor
                  bio={user.bio}
                  availability={availability}
                  onOpenEditModal={() => setIsEditModalOpen(true)}
                />
              </div>

              {/* Right Column: Skills I Can Teach & Want to Learn */}
              <div className="profile-editors-right">
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

      {/* Profile Edit Full Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        user={{
          ...user,
          teachSkills: user.teachSkills,
          learnSkills: user.learnSkills
        }}
        availability={availability}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveModalProfile}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Image Cropper Modal */}
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
