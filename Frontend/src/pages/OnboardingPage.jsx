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

        const rawTeach = Array.isArray(parsed.skillsCanTeach)
          ? parsed.skillsCanTeach
          : Array.isArray(parsed.teachSkills)
          ? parsed.teachSkills
          : [];
        const rawLearn = Array.isArray(parsed.skillsWantToLearn)
          ? parsed.skillsWantToLearn
          : Array.isArray(parsed.learnSkills)
          ? parsed.learnSkills
          : [];

        // Validate preloaded skills against backend database so invalid skills like 'abcd' are filtered out
        if (rawTeach.length > 0) {
          fetch(`${API_URL}/api/skills/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skills: rawTeach })
          })
            .then((r) => r.json())
            .then((d) => {
              if (d?.data?.validSkills) setTeachSkills(d.data.validSkills);
            })
            .catch(() => setTeachSkills(rawTeach));
        }

        if (rawLearn.length > 0) {
          fetch(`${API_URL}/api/skills/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skills: rawLearn })
          })
            .then((r) => r.json())
            .then((d) => {
              if (d?.data?.validSkills) setLearnSkills(d.data.validSkills);
            })
            .catch(() => setLearnSkills(rawLearn));
        }
      } catch (e) {
        console.error('Error loading onboarding state:', e);
      }
    }
  }, []);

  const toggleTeachSkill = (skill) => {
    const clean = (skill || '').trim();
    if (!clean) return;
    setTeachSkills((current) =>
      current.some((item) => item.toLowerCase() === clean.toLowerCase())
        ? current.filter((item) => item.toLowerCase() !== clean.toLowerCase())
        : [...current, clean]
    );
  };

  const addCustomTeach = () => {};

  const toggleLearnSkill = (skill) => {
    const clean = (skill || '').trim();
    if (!clean) return;
    setLearnSkills((current) =>
      current.some((item) => item.toLowerCase() === clean.toLowerCase())
        ? current.filter((item) => item.toLowerCase() !== clean.toLowerCase())
        : [...current, clean]
    );
  };

  const addCustomLearn = () => {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter a valid username.');
      return;
    }

    if (teachSkills.length === 0) {
      setErrorMsg('Please select at least 1 skill you can teach from the database.');
      return;
    }

    if (learnSkills.length === 0) {
      setErrorMsg('Please select at least 1 skill you want to learn from the database.');
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

        const savedTeach = data.data?.user?.skillsCanTeach || teachSkills;
        const savedLearn = data.data?.user?.skillsWantToLearn || learnSkills;

        const updatedUser = {
          ...existingUser,
          ...payload,
          ...(data.data?.user || {}),
          name: existingUser.name || cleanUsername,
          skillsCanTeach: savedTeach,
          skillsWantToLearn: savedLearn,
          teachSkills: savedTeach,
          learnSkills: savedLearn
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