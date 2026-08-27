// src/pages/OnboardingPage.jsx

import React, { useState } from 'react';
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

  // IMPORTANT:
  // Backend expects lowercase enum values.
  const [skillLevel, setSkillLevel] = useState('intermediate');

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TEACH SKILLS

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

  // LEARN SKILLS

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

  // SUBMIT

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMsg('');

    // Validate username
    if (!username.trim()) {
      setErrorMsg('Please enter a valid username.');
      return;
    }

    // Validate teach skills
    if (teachSkills.length === 0) {
      setErrorMsg(
        'Please select at least 1 skill you can teach.'
      );
      return;
    }

    // Validate learn skills
    if (learnSkills.length === 0) {
      setErrorMsg(
        'Please select at least 1 skill you want to learn.'
      );
      return;
    }

    // Get JWT created during signup/login
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      setErrorMsg(
        'Authentication expired. Please log in again.'
      );

      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend expects lowercase values:
      // beginner / intermediate / advanced
      const normalizedSkillLevel =
        skillLevel.toLowerCase();

      const response = await fetch(
        `${API_URL}/api/users/onboarding`,
        {
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
        }
      );

      // Safely read response
      const contentType =
        response.headers.get('content-type');

      let data;

      if (
        contentType &&
        contentType.includes('application/json')
      ) {
        data = await response.json();
      } else {
        const text = await response.text();

        throw new Error(
          text ||
          `Server returned ${response.status}`
        );
      }

      // Backend error
      if (!response.ok) {
        throw new Error(
          data?.message ||
          `Onboarding failed (${response.status})`
        );
      }

      console.log(
        'Onboarding successful:',
        data
      );

      // UPDATE LOCAL USER

      const existingUser =
        JSON.parse(
          localStorage.getItem(
            'skillloop_user'
          ) || '{}'
        );

      const backendUser =
        data?.data?.user || {};

      const updatedUser = {
        ...existingUser,

        ...backendUser,

        username:
          backendUser.username ||
          username.trim(),

        profilePhotoUrl:
          backendUser.profilePhotoUrl ||
          avatarUrl.trim(),

        bio:
          backendUser.bio ??
          bio.trim(),

        skillsCanTeach:
          backendUser.skillsCanTeach ||
          teachSkills,

        skillsWantToLearn:
          backendUser.skillsWantToLearn ||
          learnSkills,

        skillLevel:
          backendUser.skillLevel ||
          normalizedSkillLevel,

        onboardingCompleted: true
      };

      localStorage.setItem(
        'skillloop_user',
        JSON.stringify(updatedUser)
      );

      // GO TO DASHBOARD

      navigate('/dashboard');

    } catch (error) {
      console.error(
        'Onboarding error:',
        error
      );

      setErrorMsg(
        error.message ||
        'Unable to connect to the server.'
      );

    } finally {
      setIsSubmitting(false);
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

        <main className="onboarding-container">
          <div className="glass-panel onboarding-card">

            <OnboardingHeader />

            {errorMsg && (
              <div className="onboarding-error-banner">
                ⚠️ {errorMsg}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="onboarding-form"
            >

              {/* PROFILE */}

              <OnboardingProfileSection
                username={username}
                setUsername={setUsername}
                avatarUrl={avatarUrl}
                setAvatarUrl={setAvatarUrl}
                bio={bio}
                setBio={setBio}
              />

              {/* SKILLS */}

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

                popularTeachSkills={
                  POPULAR_TEACH_SKILLS
                }

                popularLearnSkills={
                  POPULAR_LEARN_SKILLS
                }
              />

              {/* SUBMIT */}

              <div className="onboarding-submit-wrap">
                <button
                  type="submit"
                  className="btn btn-primary btn-full onboarding-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Saving Profile...'
                    : 'Complete Profile →'}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </>
  );
}