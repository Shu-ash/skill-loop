// src/pages/OnboardingPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OnboardingHeader from '../components/OnboardingHeader';
import OnboardingProfileSection from '../components/OnboardingProfileSection';
import OnboardingSkillsSection from '../components/OnboardingSkillsSection';

const POPULAR_TEACH_SKILLS = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Figma', 
  'UI/UX Design', 'Python', 'Guitar', 'Spanish', 'Photography', 'Video Editing'
];

const POPULAR_LEARN_SKILLS = [
  'Photoshop', 'Illustrator', 'Python', 'Machine Learning', 'Public Speaking', 
  'Piano', 'French', 'Data Science', 'Sourdough Baking', 'Chess', '3D Modeling'
];

export default function OnboardingPage() {
  const navigate = useNavigate();

  // Profile Form State
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');

  // Skills Form State
  const [teachSkills, setTeachSkills] = useState([]);
  const [customTeach, setCustomTeach] = useState('');
  const [learnSkills, setLearnSkills] = useState([]);
  const [customLearn, setCustomLearn] = useState('');
  const [skillLevel, setSkillLevel] = useState('Intermediate');

  // Error messaging
  const [errorMsg, setErrorMsg] = useState('');

  // Skill Handlers
  const toggleTeachSkill = (skill) => {
    if (teachSkills.includes(skill)) {
      setTeachSkills(teachSkills.filter((s) => s !== skill));
    } else {
      setTeachSkills([...teachSkills, skill]);
    }
  };

  const addCustomTeach = () => {
    if (customTeach.trim() && !teachSkills.includes(customTeach.trim())) {
      setTeachSkills([...teachSkills, customTeach.trim()]);
      setCustomTeach('');
    }
  };

  const toggleLearnSkill = (skill) => {
    if (learnSkills.includes(skill)) {
      setLearnSkills(learnSkills.filter((s) => s !== skill));
    } else {
      setLearnSkills([...learnSkills, skill]);
    }
  };

  const addCustomLearn = () => {
    if (customLearn.trim() && !learnSkills.includes(customLearn.trim())) {
      setLearnSkills([...learnSkills, customLearn.trim()]);
      setCustomLearn('');
    }
  };

  // Form Submit
  const handleSubmit = (e) => {
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

    const userProfile = {
      username: username.trim().startsWith('@') ? username.trim() : `@${username.trim()}`,
      name: username.trim(),
      avatarUrl: avatarUrl.trim(),
      bio: bio.trim(),
      teachSkills,
      learnSkills,
      skillLevel,
      credits: 3,
      onboardingCompleted: true
    };

    localStorage.setItem('skillloop_user', JSON.stringify(userProfile));
    navigate('/dashboard');
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
            
            {/* Header Component */}
            <OnboardingHeader />

            {errorMsg && (
              <div className="onboarding-error-banner">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="onboarding-form">
              
              {/* Profile Details Component */}
              <OnboardingProfileSection 
                username={username}
                setUsername={setUsername}
                avatarUrl={avatarUrl}
                setAvatarUrl={setAvatarUrl}
                bio={bio}
                setBio={setBio}
              />

              {/* Skills Component */}
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

              {/* Complete Profile Button */}
              <div className="onboarding-submit-wrap">
                <button type="submit" className="btn btn-primary btn-full onboarding-submit-btn">
                  Complete Profile &rarr;
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </>
  );
}
