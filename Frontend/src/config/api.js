// src/config/api.js

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }
  // When running in production (deployed on Render)
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    // If hosted on the same domain as backend, use relative /api
    if (window.location.origin.includes('skill-loop-krps.onrender.com')) {
      return '/api';
    }
    // Default to Render backend
    return 'https://skill-loop-krps.onrender.com/api';
  }
  // Local development default
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = API_BASE_URL;

export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers
  });

  return response;
};

export default {
  API_BASE_URL,
  API_URL,
  getAuthHeaders,
  apiFetch
};
