// src/utils/auth.js

const API_URL = 'http://localhost:5000/api';

export const getAuthStatus = () => {
  const adminStr = localStorage.getItem('skillloop_admin');
  const userStr = localStorage.getItem('skillloop_user');
  const token = localStorage.getItem('accessToken');

  if (adminStr) {
    try {
      const admin = JSON.parse(adminStr);
      if (admin && (admin.token || admin.email || admin.role)) {
        return { isAuthenticated: true, userType: 'admin', user: admin };
      }
    } catch (e) {
      // Invalid JSON
    }
  }

  if (token) {
    try {
      const user = userStr ? JSON.parse(userStr) : null;
      return { isAuthenticated: true, userType: 'user', token, user };
    } catch (e) {}
    return { isAuthenticated: true, userType: 'user', token };
  }

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && !user.guest && (user.email || user.name) && user.name !== 'User Account') {
        return { isAuthenticated: true, userType: 'user', user };
      }
    } catch (e) {
      // Invalid JSON
    }
  }

  return { isAuthenticated: false, userType: 'guest', user: null };
};

export const clearAuthSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('skillloop_user');
  localStorage.removeItem('skillloop_admin');
};

/**
 * Robust fetch wrapper that attaches Bearer token and silently refreshes on 401
 */
export const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem('accessToken');
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  let response = await fetch(url, { ...options, headers, credentials: 'include' });

  // If unauthorized, attempt silent refresh before giving up
  if (response.status === 401) {
    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const refreshData = await refreshRes.json();
      if (refreshRes.ok && refreshData?.data?.accessToken) {
        token = refreshData.data.accessToken;
        localStorage.setItem('accessToken', token);
        if (refreshData.data.user) {
          localStorage.setItem('skillloop_user', JSON.stringify(refreshData.data.user));
        }
        // Retry original request with refreshed token
        const retryHeaders = {
          ...options.headers,
          Authorization: `Bearer ${token}`
        };
        response = await fetch(url, { ...options, headers: retryHeaders, credentials: 'include' });
      }
    } catch (err) {
      console.warn('Silent refresh attempt failed:', err);
    }
  }

  return response;
};
