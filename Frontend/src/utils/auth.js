// src/utils/auth.js

const API_URL = 'http://localhost:5000/api';

export const getAuthStatus = () => {
  const adminStr = localStorage.getItem('skillloop_admin');
  const userStr = localStorage.getItem('skillloop_user');
  const token = localStorage.getItem('accessToken');

  // Check explicit admin storage
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

  // Parse user if available to check for admin role
  let parsedUser = null;
  if (userStr) {
    try {
      parsedUser = JSON.parse(userStr);
      if (parsedUser && (parsedUser.role === 'admin' || parsedUser.role === 'superadmin')) {
        return { isAuthenticated: true, userType: 'admin', token, user: parsedUser };
      }
    } catch (e) {}
  }

  if (token) {
    return { isAuthenticated: true, userType: 'user', token, user: parsedUser };
  }

  if (parsedUser && !parsedUser.guest && (parsedUser.email || parsedUser.name) && parsedUser.name !== 'User Account') {
    return { isAuthenticated: true, userType: 'user', user: parsedUser };
  }

  return { isAuthenticated: false, userType: 'guest', user: null };
};

export const clearAuthSession = async () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('skillloop_user');
  localStorage.removeItem('skillloop_admin');

  try {
    window.dispatchEvent(new Event('auth-change'));
  } catch (e) {}

  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    // Non-blocking on network failure
  }
};

let refreshPromise = null;

export const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!refreshRes.ok) {
        // Refresh token is revoked or expired: wipe dead credentials immediately
        await clearAuthSession();
        return null;
      }

      const refreshData = await refreshRes.json();
      if (refreshData?.success && refreshData?.data?.accessToken) {
        const token = refreshData.data.accessToken;
        localStorage.setItem('accessToken', token);

        if (refreshData.data.user) {
          const user = refreshData.data.user;
          const isAdmin = user.role === 'admin' || user.role === 'superadmin';
          if (isAdmin) {
            localStorage.setItem('skillloop_admin', JSON.stringify(user));
            localStorage.removeItem('skillloop_user');
          } else {
            localStorage.setItem('skillloop_user', JSON.stringify(user));
            localStorage.removeItem('skillloop_admin');
          }
        }

        try {
          window.dispatchEvent(new Event('auth-change'));
        } catch (e) {}

        return token;
      } else {
        await clearAuthSession();
        return null;
      }
    } catch (err) {
      console.warn('Silent refresh network failure:', err);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
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

  // If unauthorized, attempt silent refresh once before giving up
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryHeaders = {
        ...options.headers,
        Authorization: `Bearer ${newToken}`
      };
      response = await fetch(url, { ...options, headers: retryHeaders, credentials: 'include' });
    }
  }

  return response;
};
