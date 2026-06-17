// src/services/auth.service.js
import { apiClient } from './api/client';
import { setTokens, clearTokens } from '@/utils/tokenManager';
import { store } from '@/store';
import { setUser, logout } from '@/store/slices/authSlice';

class AuthService {
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data;
      
      setTokens(accessToken, refreshToken);
      store.dispatch(setUser(user));
      
      // Track login event
      this.trackLoginEvent(user);
      
      return { user, accessToken, refreshToken };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { user, accessToken, refreshToken } = response.data;
      
      setTokens(accessToken, refreshToken);
      store.dispatch(setUser(user));
      
      return { user, accessToken, refreshToken };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      store.dispatch(logout());
      window.location.href = '/login';
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');
      
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      setTokens(accessToken, newRefreshToken);
      return accessToken;
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      await apiClient.post('/auth/forgot-password', { email });
      return true;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async resetPassword(token, newPassword) {
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword });
      return true;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async verifyEmail(token) {
    try {
      await apiClient.post('/auth/verify-email', { token });
      return true;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async changePassword(oldPassword, newPassword) {
    try {
      await apiClient.post('/auth/change-password', { oldPassword, newPassword });
      return true;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      store.dispatch(setUser(response.data.user));
      return response.data.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  trackLoginEvent(user) {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'login', {
        method: 'email',
        user_id: user.id,
        user_role: user.role,
      });
    }
    
    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.identify(user.id);
      window.mixpanel.people.set({
        $email: user.email,
        $name: user.name,
        role: user.role,
      });
      window.mixpanel.track('Login Success', {
        method: 'email',
        role: user.role,
      });
    }
  }

  handleAuthError(error) {
    const errorMap = {
      'invalid_credentials': 'Invalid email or password',
      'email_not_verified': 'Please verify your email before logging in',
      'account_locked': 'Your account has been locked. Please contact support',
      'user_not_found': 'No account found with this email',
      'token_expired': 'Session expired. Please login again',
      'weak_password': 'Password is too weak. Use a stronger password',
      'email_exists': 'An account with this email already exists',
    };
    
    const errorCode = error.response?.data?.code || 'unknown_error';
    const message = errorMap[errorCode] || error.response?.data?.message || 'Authentication failed';
    
    return new Error(message);
  }
}

export const authService = new AuthService();
export const refreshAccessToken = () => authService.refreshToken();