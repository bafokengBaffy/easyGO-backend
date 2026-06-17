// src/pages/driver/DriverSettings.jsx
import React, { useState } from 'react';
import {
  Bell, Lock, Moon, Globe, Shield, Smartphone, Eye,
  EyeOff, Save, Key, LogOut, Trash2, AlertTriangle
} from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const DriverSettings = () => {
  const { user, changePassword, logout } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      rideRequests: true,
      earnings: true,
      promotions: false,
      systemAlerts: true
    },
    privacy: {
      showProfile: true,
      showEarnings: false,
      shareLocation: true
    },
    preferences: {
      language: 'en',
      theme: 'light',
      distanceUnit: 'km',
      currency: 'USD'
    },
    security: {
      twoFactorAuth: false,
      biometricLogin: false
    }
  });
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Save settings API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Delete account API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Account deleted successfully');
      logout();
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const SettingSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <Icon className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );

  const ToggleSwitch = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${value ? 'bg-blue-600' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${value ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and security</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Notification Settings */}
          <SettingSection title="Notifications" icon={Bell}>
            <ToggleSwitch
              label="Ride Requests"
              description="Receive notifications for new ride requests"
              value={settings.notifications.rideRequests}
              onChange={() => setSettings({
                ...settings,
                notifications: { ...settings.notifications, rideRequests: !settings.notifications.rideRequests }
              })}
            />
            <ToggleSwitch
              label="Earnings Updates"
              description="Get notified about your earnings and payouts"
              value={settings.notifications.earnings}
              onChange={() => setSettings({
                ...settings,
                notifications: { ...settings.notifications, earnings: !settings.notifications.earnings }
              })}
            />
            <ToggleSwitch
              label="Promotions & Offers"
              description="Receive promotional messages and offers"
              value={settings.notifications.promotions}
              onChange={() => setSettings({
                ...settings,
                notifications: { ...settings.notifications, promotions: !settings.notifications.promotions }
              })}
            />
            <ToggleSwitch
              label="System Alerts"
              description="Important system updates and alerts"
              value={settings.notifications.systemAlerts}
              onChange={() => setSettings({
                ...settings,
                notifications: { ...settings.notifications, systemAlerts: !settings.notifications.systemAlerts }
              })}
            />
          </SettingSection>

          {/* Privacy Settings */}
          <SettingSection title="Privacy" icon={Lock}>
            <ToggleSwitch
              label="Show Profile to Riders"
              description="Let riders see your profile information"
              value={settings.privacy.showProfile}
              onChange={() => setSettings({
                ...settings,
                privacy: { ...settings.privacy, showProfile: !settings.privacy.showProfile }
              })}
            />
            <ToggleSwitch
              label="Show Earnings Publicly"
              description="Display your earnings on your profile"
              value={settings.privacy.showEarnings}
              onChange={() => setSettings({
                ...settings,
                privacy: { ...settings.privacy, showEarnings: !settings.privacy.showEarnings }
              })}
            />
            <ToggleSwitch
              label="Share Live Location"
              description="Share your location during active rides"
              value={settings.privacy.shareLocation}
              onChange={() => setSettings({
                ...settings,
                privacy: { ...settings.privacy, shareLocation: !settings.privacy.shareLocation }
              })}
            />
          </SettingSection>

          {/* Preferences */}
          <SettingSection title="Preferences" icon={Globe}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, language: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, theme: 'light' }
                    })}
                    className={`flex-1 p-3 rounded-lg border-2 text-center ${
                      settings.preferences.theme === 'light'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <Sun className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">Light</span>
                  </button>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, theme: 'dark' }
                    })}
                    className={`flex-1 p-3 rounded-lg border-2 text-center ${
                      settings.preferences.theme === 'dark'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <Moon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">Dark</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance Unit
                </label>
                <select
                  value={settings.preferences.distanceUnit}
                  onChange={(e) => setSettings({
                    ...settings,
                    preferences: { ...settings.preferences, distanceUnit: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="miles">Miles (mi)</option>
                </select>
              </div>
            </div>
          </SettingSection>

          {/* Security Settings */}
          <SettingSection title="Security" icon={Shield}>
            <ToggleSwitch
              label="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              value={settings.security.twoFactorAuth}
              onChange={() => setSettings({
                ...settings,
                security: { ...settings.security, twoFactorAuth: !settings.security.twoFactorAuth }
              })}
            />
            <ToggleSwitch
              label="Biometric Login"
              description="Use fingerprint or face recognition to log in"
              value={settings.security.biometricLogin}
              onChange={() => setSettings({
                ...settings,
                security: { ...settings.security, biometricLogin: !settings.security.biometricLogin }
              })}
            />
            <div className="mt-4">
              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="outline"
                icon={Key}
                fullWidth
              >
                Change Password
              </Button>
            </div>
          </SettingSection>

          {/* Danger Zone */}
          <div className="lg:col-span-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold text-red-800">Danger Zone</h2>
              </div>
              <p className="text-sm text-red-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="danger"
                icon={Trash2}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveSettings} loading={loading} icon={Save}>
            Save All Settings
          </Button>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowPasswordModal(false)} fullWidth>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} loading={loading} fullWidth>
              Change Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-800 font-medium">Warning: This action cannot be undone!</p>
            <p className="text-sm text-red-600 mt-1">
              Deleting your account will permanently remove all your data including ride history, earnings, and profile information.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} fullWidth>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount} loading={loading} fullWidth>
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Sun icon for theme selection
const Sun = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default DriverSettings;