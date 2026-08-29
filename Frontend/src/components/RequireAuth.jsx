// src/components/RequireAuth.jsx
import React from 'react';
import AuthGuardModal from './AuthGuardModal';
import { getAuthStatus } from '../utils/auth';

export default function RequireAuth({ children, pageTitle = "this page" }) {
  const { isAuthenticated } = getAuthStatus();

  if (!isAuthenticated) {
    return <AuthGuardModal pageTitle={pageTitle} />;
  }

  return children;
}
