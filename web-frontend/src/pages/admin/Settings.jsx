// src/pages/admin/Settings.jsx
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, DollarSign, Car, Users, Bell, Shield, 
  MapPin, CreditCard, Mail, Globe, Save, RefreshCw
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    pricing: {
      baseFare: 2.50,
      perKmRate: 1.50,
      perMinuteRate: 0.30,
      minimumFare: 5.00,
      cancellationFee: 3.00,
      surgeMultiplier: 1.0
    },
    driverSettings: {
      commission: 20,
      maxDistanceKm: 5,
      driverWaitTime: 5,
      minimumRating: 4.0
    },
    rideSettings: {
      maxRideDistance: 100,
      maxPassengers: 4,
      allowScheduledRides: true,
      advanceBookingWindow: 7
    },
    paymentSettings: {
      supportedMethods: ['card', 'mobile_money', 'wallet'],
      walletMinBalance: 5,
      walletMaxBalance: 500,
      refundPeriod: 7
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      rideAlerts: true,
      promotionAlerts: true
    },
    securitySettings: {
      twoFactorAuth: false,
      sessionTimeout: 3600,
      maxLoginAttempts: 5
    },
    mapSettings: {
      defaultZoom: 12,
      maxZoom: 18,
      provider: 'google_maps'
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('pricing');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSystemSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateSystemSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      await fetchSettings();
      toast.success('Settings reset to default');
    }
  };

  const tabs = [
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'driver', label: 'Drivers', icon: Car },
    { id: 'ride', label: 'Rides', icon: Users },
    { id: 'payment', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'map', label: 'Maps', icon: MapPin }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-2">Configure platform settings and preferences</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleReset} icon={RefreshCw} variant="outline">
              Reset to Default
            </Button>
            <Button onClick={handleSave} icon={Save} loading={saving}>
              Save Changes
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      px-6 py-3 flex items-center space-x-2 border-b-2 transition-colors
                      ${activeTab === tab.id 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {/* Pricing Settings */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Pricing Configuration</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Base Fare ($)"
                    type="number"
                    step="0.5"
                    value={settings.pricing.baseFare}
                    onChange={(e) => setSettings({
                      ...settings,
                      pricing: { ...settings.pricing, baseFare: parseFloat(e.target.value) }
                    })}
                  />
                  <Input
                    label="Per Kilometer Rate ($)"
                    type="number"
                    step="0.1"
                    value={settings.pricing.perKmRate}
                    onChange={(e) => setSettings({
                      ...settings,
                      pricing: { ...settings.pricing, perKmRate: parseFloat(e.target.value) }
                    })}
                  />
                  <Input
                    label="Per Minute Rate ($)"
                    type="number"
                    step="0.05"
                    value={settings.pricing.perMinuteRate}
                    onChange={(e) => setSettings({
                      ...settings,
                      pricing: { ...settings.pricing, perMinuteRate: parseFloat(e.target.value) }
                    })}
                  />
                  <Input
                    label="Minimum Fare ($)"
                    type="number"
                    step="0.5"
                    value={settings.pricing.minimumFare}
                    onChange={(e) => setSettings({
                      ...settings,
                      pricing: { ...settings.pricing, minimumFare: parseFloat(e.target.value) }
                    })}
                  />
                  <Input
                    label="Cancellation Fee ($)"
                    type="number"
                    step="0.5"
                    value={settings.pricing.cancellationFee}
                    onChange={(e) => setSettings({
                      ...settings,
                      pricing: { ...settings.pricing, cancellationFee: parseFloat(e.target.value) }
                    })}
                  />
                  <Input
                    label="Surge Multiplier"
                    type="number"
                    step="0.1"
                    value={settings.pricing.surgeMultiplier}
                    onChange={(e) => setSettings({
                      ...settings,
                      pricing: { ...settings.pricing, surgeMultiplier: parseFloat(e.target.value) }
                    })}
                  />
                </div>
              </div>
            )}

            {/* Driver Settings */}
            {activeTab === 'driver' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Driver Configuration</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Commission (%)"
                    type="number"
                    value={settings.driverSettings.commission}
                    onChange={(e) => setSettings({
                      ...settings,
                      driverSettings: { ...settings.driverSettings, commission: parseFloat(e.target.value) }
                    })}
                  />
                  <Input
                    label="Max Driver Distance (km)"
                    type="number"
                    value={settings.driverSettings.maxDistanceKm}
                    onChange={(e) => setSettings({
                      ...settings,
                      driverSettings: { ...settings.driverSettings, maxDistanceKm: parseFloat(e.target.value) }
                    })}
                  />
                  <Input
                    label="Driver Wait Time (minutes)"
                    type="number"
                    value={settings.driverSettings.driverWaitTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      driverSettings: { ...settings.driverSettings, driverWaitTime: parseInt(e.target.value) }
                    })}
                  />
                  <Input
                    label="Minimum Driver Rating"
                    type="number"
                    step="0.1"
                    value={settings.driverSettings.minimumRating}
                    onChange={(e) => setSettings({
                      ...settings,
                      driverSettings: { ...settings.driverSettings, minimumRating: parseFloat(e.target.value) }
                    })}
                  />
                </div>
              </div>
            )}

            {/* Ride Settings */}
            {activeTab === 'ride' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Ride Configuration</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Max Ride Distance (km)"
                    type="number"
                    value={settings.rideSettings.maxRideDistance}
                    onChange={(e) => setSettings({
                      ...settings,
                      rideSettings: { ...settings.rideSettings, maxRideDistance: parseFloat(e.target.value) }
                    })}
                  />
                  <Input
                    label="Max Passengers"
                    type="number"
                    value={settings.rideSettings.maxPassengers}
                    onChange={(e) => setSettings({
                      ...settings,
                      rideSettings: { ...settings.rideSettings, maxPassengers: parseInt(e.target.value) }
                    })}
                  />
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.rideSettings.allowScheduledRides}
                        onChange={(e) => setSettings({
                          ...settings,
                          rideSettings: { ...settings.rideSettings, allowScheduledRides: e.target.checked }
                        })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Allow Scheduled Rides</span>
                    </label>
                  </div>
                  <Input
                    label="Advance Booking Window (days)"
                    type="number"
                    value={settings.rideSettings.advanceBookingWindow}
                    onChange={(e) => setSettings({
                      ...settings,
                      rideSettings: { ...settings.rideSettings, advanceBookingWindow: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Payment Configuration</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supported Payment Methods
                    </label>
                    <div className="space-y-2">
                      {['card', 'mobile_money', 'wallet'].map(method => (
                        <label key={method} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.paymentSettings.supportedMethods.includes(method)}
                            onChange={(e) => {
                              let methods = [...settings.paymentSettings.supportedMethods];
                              if (e.target.checked) {
                                methods.push(method);
                              } else {
                                methods = methods.filter(m => m !== method);
                              }
                              setSettings({
                                ...settings,
                                paymentSettings: { ...settings.paymentSettings, supportedMethods: methods }
                              });
                            }}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="ml-2 text-sm capitalize">{method.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Input
                    label="Wallet Minimum Balance ($)"
                    type="number"
                    value={settings.paymentSettings.walletMinBalance}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentSettings: { ...settings.paymentSettings, walletMinBalance: parseFloat(e.target.value) }
                    })}
                  />
                  <Input
                    label="Wallet Maximum Balance ($)"
                    type="number"
                    value={settings.paymentSettings.walletMaxBalance}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentSettings: { ...settings.paymentSettings, walletMaxBalance: parseFloat(e.target.value) }
                    })}
                  />
                  <Input
                    label="Refund Period (days)"
                    type="number"
                    value={settings.paymentSettings.refundPeriod}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentSettings: { ...settings.paymentSettings, refundPeriod: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
                <div className="space-y-3">
                  {['emailNotifications', 'pushNotifications', 'smsNotifications', 'rideAlerts', 'promotionAlerts'].map(notif => (
                    <label key={notif} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="capitalize">{notif.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings[notif]}
                        onChange={(e) => setSettings({
                          ...settings,
                          notificationSettings: { ...settings.notificationSettings, [notif]: e.target.checked }
                        })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Security Configuration</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.securitySettings.twoFactorAuth}
                        onChange={(e) => setSettings({
                          ...settings,
                          securitySettings: { ...settings.securitySettings, twoFactorAuth: e.target.checked }
                        })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Enable Two-Factor Authentication</span>
                    </label>
                  </div>
                  <Input
                    label="Session Timeout (seconds)"
                    type="number"
                    value={settings.securitySettings.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      securitySettings: { ...settings.securitySettings, sessionTimeout: parseInt(e.target.value) }
                    })}
                  />
                  <Input
                    label="Max Login Attempts"
                    type="number"
                    value={settings.securitySettings.maxLoginAttempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      securitySettings: { ...settings.securitySettings, maxLoginAttempts: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
            )}

            {/* Map Settings */}
            {activeTab === 'map' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-4">Map Configuration</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Default Zoom Level"
                    type="number"
                    value={settings.mapSettings.defaultZoom}
                    onChange={(e) => setSettings({
                      ...settings,
                      mapSettings: { ...settings.mapSettings, defaultZoom: parseInt(e.target.value) }
                    })}
                  />
                  <Input
                    label="Maximum Zoom Level"
                    type="number"
                    value={settings.mapSettings.maxZoom}
                    onChange={(e) => setSettings({
                      ...settings,
                      mapSettings: { ...settings.mapSettings, maxZoom: parseInt(e.target.value) }
                    })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Map Provider
                    </label>
                    <select
                      value={settings.mapSettings.provider}
                      onChange={(e) => setSettings({
                        ...settings,
                        mapSettings: { ...settings.mapSettings, provider: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="google_maps">Google Maps</option>
                      <option value="mapbox">Mapbox</option>
                      <option value="leaflet">Leaflet</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;