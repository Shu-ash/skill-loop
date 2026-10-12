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
import { fetchWithAuth, getAuthStatus } from '../utils/auth';

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
          name: parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || 'Member',
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
  const [editModalTab, setEditModalTab] = useState('basic');
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
    if (user.name && user.name !== 'Member' && user.name.trim().length > 0) score += 20;
    if (user.username && user.username !== '@user' && user.username.trim().length > 1) score += 15;
    if (user.bio && user.bio.trim().length > 5) score += 20;
    if (user.profilePhotoUrl && user.profilePhotoUrl.length > 10) score += 15;
    if (user.coverPhotoUrl && user.coverPhotoUrl.length > 10) score += 10;
    if (user.teachSkills && user.teachSkills.length > 0) score += 10;
    if (user.learnSkills && user.learnSkills.length > 0) score += 10;
    return Math.min(score, 100);
  }, [user]);

  const [allBadges, setAllBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/users/me`);
      if (!res.ok) return;

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
          credits: u.credits ?? 3,
          teachSkills: Array.isArray(u.skillsCanTeach) ? u.skillsCanTeach : [],
          learnSkills: Array.isArray(u.skillsWantToLearn) ? u.skillsWantToLearn : [],
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

  const fetchUserBadges = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/badges`),
        fetchWithAuth(`${API_BASE_URL}/badges/me`)
      ]);
      const allData = await allRes.json();
      const myData = await myRes.json();
      if (allData.success && Array.isArray(allData.data?.badges)) {
        setAllBadges(allData.data.badges);
      }
      if (myData.success && Array.isArray(myData.data?.userBadges)) {
        setEarnedBadges(myData.data.userBadges);
      }
    } catch (err) {
      console.error('Failed to load achievement badges:', err);
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
    fetchUserBadges();
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
    const res = await fetchWithAuth(`${API_BASE_URL}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.message || 'Failed to save profile changes.');
    }
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
      fetchUserBadges();
    }
  };

  // Save changes from EditProfileModal (including skills addition & removal)
  const handleSaveModalProfile = async (updatedData) => {
    const teachSkills = Array.isArray(updatedData.skillsCanTeach) ? updatedData.skillsCanTeach : [];
    const learnSkills = Array.isArray(updatedData.skillsWantToLearn) ? updatedData.skillsWantToLearn : [];

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

    if (updatedData.availability) {
      setAvailability(updatedData.availability);
    }
    setIsEditModalOpen(false);
  };

  const earnedBadgeMap = useMemo(() => {
    const map = new Map();
    earnedBadges.forEach((ub) => {
      const b = ub.badgeId;
      if (b && b.criteriaKey) {
        map.set(b.criteriaKey, ub.awardedAt);
      }
    });
    return map;
  }, [earnedBadges]);

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
              <div className="profile-success-banner">
                ✓ {savedSuccess}
              </div>
            )}

            {/* Profile Header Hero Card */}
            <ProfileHeaderCard
              user={user}
              onEditProfile={() => { setEditModalTab('basic'); setIsEditModalOpen(true); }}
              onChangePassword={() => setIsPasswordModalOpen(true)}
              onAvatarFileSelected={(file) => handleFileForCrop(file, 'avatar')}
              onCoverFileSelected={(file) => handleFileForCrop(file, 'cover')}
            />

            {/* Side-by-Side 2-Column Editors Layout */}
            <div className="profile-editors-grid profile-editors-spacing">
              {/* Left Column: Read-Only Info & Availability & Profile Strength */}
              <div className="profile-editors-left">
                <ProfileDetailsEditor
                  bio={user.bio}
                  availability={availability}
                  profileStrength={profileStrength}
                  onOpenEdit={() => { setEditModalTab('basic'); setIsEditModalOpen(true); }}
                />
              </div>

              {/* Right Column: Skills I Can Teach & Want to Learn */}
              <div className="profile-editors-right">
                <ProfileSkillsTagsCard
                  teachSkills={user.teachSkills}
                  learnSkills={user.learnSkills}
                  onOpenEdit={() => { setEditModalTab('skills'); setIsEditModalOpen(true); }}
                />
              </div>
            </div>

            {/* Achievement Badges Showcase */}
            {allBadges.length > 0 && (
              <div
                className="glass-card"
                style={{
                  marginTop: '1.5rem',
                  padding: '1.5rem',
                  borderRadius: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>🏅 Achievement Badges</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      Automatically unlocked as you complete skill swaps, mentor peers, and build your reputation.
                    </p>
                  </div>
                  <span
                    style={{
                      padding: '5px 12px',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(99, 102, 241, 0.25)'
                    }}
                  >
                    {earnedBadges.length} / {allBadges.length} Unlocked
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                    gap: '12px'
                  }}
                >
                  {allBadges.map((b) => {
                    const isEarned = earnedBadgeMap.has(b.criteriaKey);
                    const awardedAt = earnedBadgeMap.get(b.criteriaKey);
                    return (
                      <div
                        key={b._id || b.criteriaKey}
                        style={{
                          padding: '14px',
                          borderRadius: '14px',
                          background: isEarned
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(99, 102, 241, 0.08))'
                            : 'rgba(148, 163, 184, 0.06)',
                          border: isEarned
                            ? '1px solid rgba(245, 158, 11, 0.35)'
                            : '1px dashed var(--glass-border, rgba(148, 163, 184, 0.25))',
                          opacity: isEarned ? 1 : 0.65,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '1.6rem', filter: isEarned ? 'none' : 'grayscale(100%)' }}>
                            {b.icon || '🏅'}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              background: isEarned ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                              color: isEarned ? '#10b981' : 'var(--text-muted)'
                            }}
                          >
                            {isEarned ? '✓ Unlocked' : '🔒 Locked'}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                          {b.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {b.description}
                        </div>
                        {isEarned && awardedAt && (
                          <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600, marginTop: 'auto' }}>
                            Earned {new Date(awardedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>

        <MobileNav />
      </div>

      {/* Profile Edit Full Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        initialTab={editModalTab}
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
