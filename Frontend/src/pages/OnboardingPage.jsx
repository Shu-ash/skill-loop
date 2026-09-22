// src/pages/OnboardingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import OnboardingHeader from '../components/OnboardingHeader';
import OnboardingProfileSection from '../components/OnboardingProfileSection';
import OnboardingSkillsSection from '../components/OnboardingSkillsSection';

const API_URL = 'http://localhost:5000';

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

  // Dynamic Live Categories from MongoDB
  const [categoriesList, setCategoriesList] = useState([]);

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch live categories with nested skills from MongoDB database
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.categories)) {
          setCategoriesList(data.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories in onboarding:', err);
      }
    };
    fetchCategories();

    const stored = localStorage.getItem('skillloop_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.username) setUsername(parsed.username.replace(/^@/, ''));
        if (parsed.profilePhotoUrl || parsed.avatarUrl) setAvatarUrl(parsed.profilePhotoUrl || parsed.avatarUrl);
        if (parsed.bio) setBio(parsed.bio);
        if (Array.isArray(parsed.skillsCanTeach)) setTeachSkills(parsed.skillsCanTeach);
        else if (Array.isArray(parsed.teachSkills)) setTeachSkills(parsed.teachSkills);
        if (Array.isArray(parsed.skillsWantToLearn)) setLearnSkills(parsed.skillsWantToLearn);
        else if (Array.isArray(parsed.learnSkills)) setLearnSkills(parsed.learnSkills);
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

    const cleanUsername = username.trim().replace(/^@/, '');

    const payload = {
      username: cleanUsername,
      profilePhotoUrl: avatarUrl.trim(),
      bio: bio.trim(),
      headline: `${teachSkills.slice(0, 2).join(' & ')} Mentor`,
      skillsCanTeach: teachSkills,
      skillsWantToLearn: learnSkills,
      skillLevel,
      onboardingCompleted: true
    };

    try {
      if (accessToken) {
        const response = await fetch(`${API_URL}/api/users/onboarding`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          credentials: 'include',
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Onboarding failed');
        }

        const updatedUser = {
          ...existingUser,
          ...payload,
          name: existingUser.name || cleanUsername,
          teachSkills,
          learnSkills
        };

        localStorage.setItem('skillloop_user', JSON.stringify(updatedUser));
        navigate('/dashboard');
        return;
      }

      const updatedUser = {
        ...existingUser,
        ...payload,
        name: existingUser.name || cleanUsername,
        teachSkills,
        learnSkills
      };

      localStorage.setItem('skillloop_user', JSON.stringify(updatedUser));
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding submit error:', err);
      setErrorMsg(err.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="liquid-bg">
        <div className="liquid-blob blob-1" />
        <div className="liquid-blob blob-2" />
        <div className="liquid-blob blob-3" />
      </div>

      <div id="app">
        <Navbar />

        <div className="onboarding-container">
          <div className="glass-panel onboarding-card">
            <OnboardingHeader />

            {errorMsg && (
              <div className="glass-panel onboarding-error-banner">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
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
                categoriesList={categoriesList}
              />

              <div className="onboarding-submit-row">
                <button
                  type="submit"
                  className="btn btn-primary btn-full onboarding-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Saving your profile...'
                    : 'Complete setup & enter SkillLoop →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}