// src/pages/RequestsPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import RequestsTabNav from '../components/RequestsTabNav';
import RequestCard from '../components/RequestCard';

const API_URL = 'http://localhost:5000/api';

export default function RequestsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('received');

  const [requests, setRequests] = useState({
    received: [],
    sent: [],
    accepted: [],
    history: []
  });

  const [loading, setLoading] = useState(true);

  // GET RECEIVED + SENT REQUESTS

  const fetchRequests = async () => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      const [receivedResponse, sentResponse] =
        await Promise.all([
          fetch(`${API_URL}/requests/received`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            credentials: 'include'
          }),

          fetch(`${API_URL}/requests/sent`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            credentials: 'include'
          })
        ]);

      const receivedData = await receivedResponse.json();
      const sentData = await sentResponse.json();

      if (!receivedResponse.ok) {
        throw new Error(
          receivedData.message ||
          'Failed to load received requests'
        );
      }

      if (!sentResponse.ok) {
        throw new Error(
          sentData.message ||
          'Failed to load sent requests'
        );
      }

      const receivedRequests =
        receivedData?.data?.requests || [];

      const sentRequests =
        sentData?.data?.requests || [];

      // FORMAT BACKEND REQUEST

      const formatRequest = (request) => {
        const user =
          request.sender ||
          request.receiver ||
          {};

        const firstName =
          user.firstName || '';

        const lastName =
          user.lastName || '';

        const name =
          user.name ||
          `${firstName} ${lastName}`.trim() ||
          'Skill Loop User';

        return {
          id: request._id,

          user: {
            name,

            avatar:
              name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase(),

            avatarBg:
              'var(--violet-primary)'
          },

          skillWant:
            request.skillWant || '',

          message:
            request.message || '',

          timeAgo:
            request.createdAt
              ? new Date(
                request.createdAt
              ).toLocaleString()
              : '',

          status:
            request.status || 'pending'
        };
      };

      const formattedReceived =
        receivedRequests.map(formatRequest);

      const formattedSent =
        sentRequests.map((request) => {
          const formatted =
            formatRequest(request);

          return {
            ...formatted,

            user: {
              ...formatted.user
            }
          };
        });

      // Accepted requests
      const acceptedReceived =
        formattedReceived.filter(
          (request) =>
            request.status === 'accepted'
        );

      const acceptedSent =
        formattedSent.filter(
          (request) =>
            request.status === 'accepted'
        );

      const accepted = [
        ...acceptedReceived,
        ...acceptedSent
      ];

      setRequests({
        received: formattedReceived.filter(
          (request) =>
            request.status === 'pending'
        ),

        sent: formattedSent,

        accepted,

        history: []
      });

    } catch (error) {
      console.error(
        'Failed to fetch requests:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // LOAD REQUESTS

  useEffect(() => {
    fetchRequests();
  }, []);

  // ACCEPT REQUES

  const handleAccept = async (reqId) => {
    const accessToken =
      localStorage.getItem('accessToken');

    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/requests/${reqId}/accept`,
        {
          method: 'PATCH',

          headers: {
            Authorization:
              `Bearer ${accessToken}`
          },

          credentials: 'include'
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Failed to accept request'
        );
      }

      // Find accepted request
      const target =
        requests.received.find(
          (request) =>
            request.id === reqId
        );

      if (target) {
        const acceptedRequest = {
          ...target,
          status: 'accepted'
        };

        setRequests((previous) => ({
          ...previous,

          received:
            previous.received.filter(
              (request) =>
                request.id !== reqId
            ),

          accepted: [
            acceptedRequest,
            ...previous.accepted
          ]
        }));
      }

    } catch (error) {
      console.error(
        'Accept request failed:',
        error
      );

      alert(
        error.message ||
        'Failed to accept request'
      );
    }
  };

  // DECLINE REQUEST

  const handleDecline = async (reqId) => {
    const accessToken =
      localStorage.getItem('accessToken');

    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/requests/${reqId}/decline`,
        {
          method: 'PATCH',

          headers: {
            Authorization:
              `Bearer ${accessToken}`
          },

          credentials: 'include'
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Failed to decline request'
        );
      }

      // Remove declined request
      setRequests((previous) => ({
        ...previous,

        received:
          previous.received.filter(
            (request) =>
              request.id !== reqId
          )
      }));

    } catch (error) {
      console.error(
        'Decline request failed:',
        error
      );

      alert(
        error.message ||
        'Failed to decline request'
      );
    }
  };

  // SCHEDULE

  const handleSchedule = (reqId) => {
    navigate('/schedule');
  };

  const currentList =
    requests[activeTab] || [];

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

          <Sidebar
            user={{
              name: 'Harsh',
              credits: 3,
              avatar: 'HA'
            }}
          />

          <main className="main-content">

            <div className="page-title-row">
              <div>
                <h2>Swap requests inbox</h2>

                <p>
                  Manage everything you've
                  sent and received from peers.
                </p>
              </div>
            </div>

            {/* REQUEST TABS */}

            <RequestsTabNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              counts={{
                received:
                  requests.received.length,

                sent:
                  requests.sent.length,

                accepted:
                  requests.accepted.length
              }}
            />

            {/* REQUEST LIST */}

            <div className="requests-list-wrapper">

              {loading ? (
                <div
                  className="glass-panel"
                  style={{
                    padding: '2.5rem',
                    textAlign: 'center'
                  }}
                >
                  <p>
                    Loading requests...
                  </p>
                </div>
              ) : currentList.length > 0 ? (

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

                <div
                  className="glass-panel"
                  style={{
                    padding: '2.5rem',
                    textAlign: 'center',
                    color:
                      'var(--slate-500)'
                  }}
                >
                  <p>
                    No requests found in this tab.
                  </p>
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