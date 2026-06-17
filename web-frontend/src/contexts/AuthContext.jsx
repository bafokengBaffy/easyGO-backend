// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '@/services/auth.service';
import { setUser, logout, setLoading } from '@/store/slices/authSlice';
import { socketService } from '@/services/socket.service';

const AuthContext = createContext(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token && !user) {
        try {
          dispatch(setLoading(true));
          const userData = await authService.getCurrentUser();
          dispatch(setUser(userData));
          socketService.connect(token);
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          dispatch(logout());
        } finally {
          dispatch(setLoading(false));
          setInitialized(true);
        }
      } else {
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      socketService.connect(localStorage.getItem('accessToken'));
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated, user]);

  const value = {
    user,
    isAuthenticated,
    loading: loading || !initialized,
    hasRole: (roles) => {
      if (!user) return false;
      if (typeof roles === 'string') return user.role === roles;
      return roles.includes(user.role);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};