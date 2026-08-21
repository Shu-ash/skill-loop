// src/pages/SessionsPage.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import SessionProgressStepper from '../components/SessionProgressStepper';
import SessionCard from '../components/SessionCard';

// Sample scheduled session data
const MOCK_SESSION = {
  id: 'sess_101',
  title: 'Frontend Development Mentorship',
  partnerName: 'Sujit Bauna',
  partnerAvatar: 'SB',
  date: 'Today',
  time: '11:00 AM',
  mode: 'Online Video Call',
  meetLink: 'meet.google.com/',
  status: 'in_progress'
};

export default function SessionsPage() {
  const [session, setSession] = useState(MOCK_SESSION);
  const [currentStep, setCurrentStep] = useState(3); // 3 = Call in Progress

  const handleJoinCall = (link) => {
    window.open(`https://${link}`, '_blank');
  };

  const handleMarkComplete = (sessId) => {
    setCurrentStep(4);
    alert('Session marked as complete! +1 Skill Credit awarded.');
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
          <Sidebar user={{ name: 'Harsh Vishwakarma', credits: 3, avatar: 'HV' }} />

          <main className="main-content">
            <div className="page-title-row">
              <div>
                <h2>Active Session</h2>
                <p>Session with Sujit Bauna • Today, 11:00 AM</p>
              </div>
            </div>

            {/* Component 1: Progress Stepper */}
            <div className="glass-panel" style={{ padding: '1.5rem 1.8rem', borderRadius: '24px' }}>
              <SessionProgressStepper currentStep={currentStep} />
            </div>

            {/* Component 2: Session Main Card */}
            <SessionCard
              session={session}
              onJoinCall={handleJoinCall}
              onMarkComplete={handleMarkComplete}
            />
          </main>
        </div>

        <MobileNav />
      </div>
    </>
  );
}
