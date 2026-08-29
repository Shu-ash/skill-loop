// src/pages/OnboardingPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import OnboardingHeader from '../components/OnboardingHeader';
import OnboardingProfileSection from '../components/OnboardingProfileSection';
import OnboardingSkillsSection from '../components/OnboardingSkillsSection';

const API_URL = 'http://localhost:5000';

const POPULAR_TEACH_SKILLS = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Node.js',
  'Figma',
  'UI/UX Design',
  'Python',
  'Guitar',
  'Spanish',
  'Photography',
  'Video Editing'
];

const POPULAR_LEARN_SKILLS = [
  'Photoshop',
  'Illustrator',
  'Python',
  'Machine Learning',
  'Public Speaking',
  'Piano',
  'French',
  'Data Science',
  'Sourdough Baking',
  'Chess',
  '3D Modeling'
];

export default function OnboardingPage() {
  const navigate = useNavigate();

  // Profile
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');

  // Skills
  const [teachSkills, setTeachSkills] = useState([]);
  const [customTeach, setCustomTeach] = useState('');

  const [learnSkills, setLearnSkills] = useState([]);
  const [customLearn, setCustomLearn] = useState('');

  const [skillLevel, setSkillLevel] = useState('intermediate');

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('skillloop_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.username) setUsername(parsed.username);
        if (parsed.profilePhotoUrl || parsed.avatarUrl) setAvatarUrl(parsed.profilePhotoUrl || parsed.avatarUrl);
        if (parsed.bio) setBio(parsed.bio);
        if (Array.isArray(parsed.teachSkills)) setTeachSkills(parsed.teachSkills);
        if (Array.isArray(parsed.learnSkills)) setLearnSkills(parsed.learnSkills);
      } catch (e) {
        console.error('Error loading onboarding state:', e);
      }
    }
  }, []);

  const toggleTeachSkill = (skill) => {
    setTeachSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill]
    );
  };

  const addCustomTeach = () => {
    const skill = customTeach.trim();
    if (!skill) return;
    if (!teachSkills.includes(skill)) {
      setTeachSkills((current) => [...current, skill]);
    }
    setCustomTeach('');
  };

  const toggleLearnSkill = (skill) => {
    setLearnSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill]
    );
  };

  const addCustomLearn = () => {
    const skill = customLearn.trim();
    if (!skill) return;
    if (!learnSkills.includes(skill)) {
      setLearnSkills((current) => [...current, skill]);
    }
    setCustomLearn('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter a valid username.');
      return;
    }

    if (teachSkills.length === 0) {
      setErrorMsg('Please select at least 1 skill you can teach.');
      return;
    }

    if (learnSkills.length === 0) {
      setErrorMsg('Please select at least 1 skill you want to learn.');
      return;
    }

    setIsSubmitting(true);
    const accessToken = localStorage.getItem('accessToken');
    const existingUser = JSON.parse(localStorage.getItem('skillloop_user') || '{}');

    try {
      const normalizedSkillLevel = skillLevel.toLowerCase();

      if (accessToken) {
        const response = await fetch(`${API_URL}/api/users/onboarding`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          credentials: 'include',
          body: JSON.stringify({
            username: username.trim(),
            profilePhotoUrl: avatarUrl.trim(),
            bio: bio.trim(),
            skillsCanTeach: teachSkills,
            skillsWantToLearn: learnSkills,
            skillLevel: normalizedSkillLevel
          })
        });

        if (response.ok) {
          const data = await response.json();
          const backendUser = data?.data?.user || {};
          const updatedUser = {
            ...existingUser,
            ...backendUser,
            username: backendUser.username || username.trim(),
            profilePhotoUrl: backendUser.profilePhotoUrl || avatarUrl.trim(),
            bio: backendUser.bio ?? bio.trim(),
            teachSkills: backendUser.skillsCanTeach || teachSkills,
            learnSkills: backendUser.skillsWantToLearn || learnSkills,
            skillLevel: backendUser.skillLevel || normalizedSkillLevel,
            onboardingCompleted: true
          };
          localStorage.setItem('skillloop_user', JSON.stringify(updatedUser));
          navigate('/profile');
          return;
        }
      }
    } catch (error) {
      console.log('Onboarding fallback saving locally...');
    }

    // Local fallback update
    const updatedUser = {
      ...existingUser,
      username: username.trim(),
      profilePhotoUrl: avatarUrl.trim(),
      bio: bio.trim(),
      teachSkills,
      learnSkills,
      skillLevel: skillLevel.toLowerCase(),
      onboardingCompleted: true
    };

    localStorage.setItem('skillloop_user', JSON.stringify(updatedUser));
    setIsSubmitting(false);
    navigate('/profile');
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

        <main className="onboarding-container">
          <div className="glass-panel onboarding-card">
            <OnboardingHeader />

            {errorMsg && (
              <div className="onboarding-error-banner">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="onboarding-form">
              <OnboardingProfileSection
                username={username}
                setUsername={setUsername}
                avatarUrl={avatarUrl}
                setAvatarUrl={setAvatarUrl}
                bio={bio}
                setBio={setBio}
              />

              <OnboardingSkillsSection
                teachSkills={teachSkills}
                toggleTeachSkill={toggleTeachSkill}
                customTeach={customTeach}
                setCustomTeach={setCustomTeach}
                addCustomTeach={addCustomTeach}

                learnSkills={learnSkills}
                toggleLearnSkill={toggleLearnSkill}
                customLearn={customLearn}
                setCustomLearn={setCustomLearn}
                addCustomLearn={addCustomLearn}

                skillLevel={skillLevel}
                setSkillLevel={setSkillLevel}

                popularTeachSkills={POPULAR_TEACH_SKILLS}
                popularLearnSkills={POPULAR_LEARN_SKILLS}
              />

              <div className="onboarding-submit-wrap">
                <button
                  type="submit"
                  className="btn btn-primary btn-full onboarding-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving Profile...' : 'Complete Profile →'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}