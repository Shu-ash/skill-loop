// src/config/api.js

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }
  // When running in production (e.g. deployed on Render as unified web service or static site)
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    return '/api';
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
