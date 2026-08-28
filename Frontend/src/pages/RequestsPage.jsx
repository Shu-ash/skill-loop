// src/pages/RequestsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import RequestsTabNav from '../components/RequestsTabNav';
import RequestCard from '../components/RequestCard';

// Sample mock swap requests data
const INITIAL_REQUESTS = {
  received: [
    {
      id: 'req_1',
      user: { name: 'Sujit Bauna', avatar: 'SB', avatarBg: 'var(--coral-primary)' },
      skillWant: 'React Hooks',
      message: 'Would love to swap! I can teach you Backend Development in return.',
      timeAgo: '2h ago',
      status: 'pending'
    },
    {
      id: 'req_2',
      user: { name: 'Debosmita Laha', avatar: 'DL', avatarBg: 'var(--deep-violet)' },
      skillWant: 'UI Design',
      message: 'I can teach Python for Beginners & Pandas in return.',
      timeAgo: '6h ago',
      status: 'pending'
    },
    {
      id: 'req_3',
      user: { name: 'Milon Hackathon', avatar: 'MH', avatarBg: 'var(--mint-primary)' },
      skillWant: 'JavaScript',
      message: 'Happy to trade MongoDB & Express.js for JavaScript guidance!',
      timeAgo: '1 day ago',
      status: 'pending'
    }
  ],
  sent: [
    {
      id: 'req_4',
      user: { name: 'Sample Member 1', avatar: 'S1', avatarBg: 'var(--violet-primary)' },
      skillWant: 'Conversational English',
      message: 'Hi! Would love to trade HTML/CSS tutoring for English practice.',
      timeAgo: '3h ago',
      status: 'pending'
    }
  ],
  accepted: [
    {
      id: 'req_5',
      user: { name: 'Harsh Vishwakarma', avatar: 'HV', avatarBg: 'var(--gold-primary)' },
      skillWant: 'Frontend Development',
      message: 'Accepted your request! Let us schedule a 45-minute lesson.',
      timeAgo: 'Yesterday',
      status: 'accepted'
    }
  ],
  history: []
};

export default function RequestsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent' | 'accepted' | 'history'
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const handleAccept = (reqId) => {
    // Move request from received to accepted
    const target = requests.received.find((r) => r.id === reqId);
    if (target) {
      const updatedTarget = { ...target, status: 'accepted' };
      setRequests({
        ...requests,
        received: requests.received.filter((r) => r.id !== reqId),
        accepted: [updatedTarget, ...requests.accepted]
      });
    }
  };

  const handleDecline = (reqId) => {
    setRequests({
      ...requests,
      received: requests.received.filter((r) => r.id !== reqId)
    });
  };

  const handleSchedule = (reqId) => {
    navigate('/schedule');
  };

  const currentList = requests[activeTab] || [];

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
          <Sidebar user={{ name: 'Harsh', credits: 3, avatar: 'HA' }} />

          <main className="main-content">
            <div className="page-title-row">
              <div>
                <h2>Swap requests inbox</h2>
                <p>Manage everything you've sent and received from peers.</p>
              </div>
            </div>

            {/* Component 1: Requests Tab Nav */}
            <RequestsTabNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              counts={{
                received: requests.received.length,
                sent: requests.sent.length,
                accepted: requests.accepted.length
              }}
            />

            {/* Component 2: Request Cards List */}
            <div className="requests-list-wrapper">
              {currentList.length > 0 ? (
                currentList.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onSchedule={handleSchedule}
                  />
                ))
              ) : (
                <div className="glass-panel empty-requests-card">
                  <p>No requests found in this tab.</p>
                </div>
              )}
            </div>
          </main>
        </div>

        <MobileNav />
      </div>
    </>
  );
}
