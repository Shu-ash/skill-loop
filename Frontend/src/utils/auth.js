// src/utils/auth.js

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
