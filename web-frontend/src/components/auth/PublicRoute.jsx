// src/components/auth/PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return <Navigate to={`/${user.role || 'rider'}`} replace />;
  }

  return children;
};