// src/routes/index.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicRoute } from '@/components/auth/PublicRoute';

// Public Pages
import LandingPage from '@/pages/public/LandingPage';
import LoginPage from '@/pages/public/LoginPage';
import RegisterPage from '@/pages/public/RegisterPage';
import ForgotPasswordPage from '@/pages/public/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/public/ResetPasswordPage';
import VerifyEmailPage from '@/pages/public/VerifyEmailPage';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import Users from '@/pages/admin/Users';
import Drivers from '@/pages/admin/Drivers';
import Rides from '@/pages/admin/Rides';
import Payments from '@/pages/admin/Payments';
import Analytics from '@/pages/admin/Analytics';
import Reports from '@/pages/admin/Reports';
import Settings from '@/pages/admin/Settings';

// Driver Pages
import DriverDashboard from '@/pages/driver/DriverDashboard';
import CurrentTrip from '@/pages/driver/CurrentTrip';
import Earnings from '@/pages/driver/Earnings';
import Vehicle from '@/pages/driver/Vehicle';
import AvailableRides from '@/pages/driver/AvailableRides';
import RideHistory from '@/pages/driver/RideHistory';
import DriverProfile from '@/pages/driver/DriverProfile';
import DriverSettings from '@/pages/driver/DriverSettings';

// Rider Pages
import RiderDashboard from '@/pages/rider/RiderDashboard';
import RideBooking from '@/pages/rider/RideBooking';
import RiderRideHistory from '@/pages/rider/RideHistory';
import RiderPayments from '@/pages/rider/Payments';
import RiderProfile from '@/pages/rider/RiderProfile';
import SavedPlaces from '@/pages/rider/SavedPlaces';

// Common Pages
import Notifications from '@/pages/common/Notifications';
import SupportTickets from '@/pages/common/SupportTickets';
import Referrals from '@/pages/common/Referrals';
import NotFoundPage from '@/pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
      <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
      <Route path="/admin/drivers" element={<ProtectedRoute allowedRoles={['admin']}><Drivers /></ProtectedRoute>} />
      <Route path="/admin/rides" element={<ProtectedRoute allowedRoles={['admin']}><Rides /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><Payments /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />

      {/* Driver Routes */}
      <Route path="/driver" element={<ProtectedRoute allowedRoles={['driver']}><DriverDashboard /></ProtectedRoute>} />
      <Route path="/driver/current-trip" element={<ProtectedRoute allowedRoles={['driver']}><CurrentTrip /></ProtectedRoute>} />
      <Route path="/driver/earnings" element={<ProtectedRoute allowedRoles={['driver']}><Earnings /></ProtectedRoute>} />
      <Route path="/driver/vehicle" element={<ProtectedRoute allowedRoles={['driver']}><Vehicle /></ProtectedRoute>} />
      <Route path="/driver/available-rides" element={<ProtectedRoute allowedRoles={['driver']}><AvailableRides /></ProtectedRoute>} />
      <Route path="/driver/ride-history" element={<ProtectedRoute allowedRoles={['driver']}><RideHistory /></ProtectedRoute>} />
      <Route path="/driver/profile" element={<ProtectedRoute allowedRoles={['driver']}><DriverProfile /></ProtectedRoute>} />
      <Route path="/driver/settings" element={<ProtectedRoute allowedRoles={['driver']}><DriverSettings /></ProtectedRoute>} />

      {/* Rider Routes */}
      <Route path="/rider" element={<ProtectedRoute allowedRoles={['rider']}><RiderDashboard /></ProtectedRoute>} />
      <Route path="/rider/book" element={<ProtectedRoute allowedRoles={['rider']}><RideBooking /></ProtectedRoute>} />
      <Route path="/rider/history" element={<ProtectedRoute allowedRoles={['rider']}><RiderRideHistory /></ProtectedRoute>} />
      <Route path="/rider/payments" element={<ProtectedRoute allowedRoles={['rider']}><RiderPayments /></ProtectedRoute>} />
      <Route path="/rider/profile" element={<ProtectedRoute allowedRoles={['rider']}><RiderProfile /></ProtectedRoute>} />
      <Route path="/rider/saved-places" element={<ProtectedRoute allowedRoles={['rider']}><SavedPlaces /></ProtectedRoute>} />

      {/* Common Routes - Accessible by all authenticated users */}
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/support" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
      <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};