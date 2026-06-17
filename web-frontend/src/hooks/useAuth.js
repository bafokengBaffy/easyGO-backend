// src/hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { setUser, logout, setLoading } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const login = async (email, password) => {
    try {
      dispatch(setLoading(true));
      const result = await authService.login(email, password);
      toast.success('Welcome back!');
      navigate(result.user.role === 'admin' ? '/admin' : `/${result.user.role}`);
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (userData) => {
    try {
      dispatch(setLoading(true));
      const result = await authService.register(userData);
      toast.success('Account created successfully! Please verify your email.');
      navigate('/verify-email');
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logoutUser = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/login');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      dispatch(setLoading(true));
      const updatedUser = await authService.updateProfile(profileData);
      dispatch(setUser(updatedUser));
      toast.success('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      dispatch(setLoading(true));
      await authService.changePassword(oldPassword, newPassword);
      toast.success('Password changed successfully');
      return true;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const forgotPassword = async (email) => {
    try {
      await authService.forgotPassword(email);
      toast.success('Password reset link sent to your email');
      return true;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await authService.resetPassword(token, newPassword);
      toast.success('Password reset successfully. Please login');
      navigate('/login');
      return true;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout: logoutUser,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
  };
};