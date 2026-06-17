import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';

const prototypeBase = '/prototype';

const routes = [
  ['/', 'index.html'],
  ['/login', 'login.html'],
  ['/register', 'signup.html'],
  ['/signup', 'signup.html'],

  ['/admin', 'admin-panel.html'],
  ['/admin/dashboard', 'admin-panel.html'],
  ['/admin/users', 'admin-users.html'],
  ['/admin/drivers', 'admin-drivers.html'],
  ['/admin/rides', 'admin-trips.html'],
  ['/admin/trips', 'admin-trips.html'],
  ['/admin/payments', 'admin-payments.html'],
  ['/admin/promotions', 'admin-promotions.html'],
  ['/admin/zones', 'admin-zones.html'],
  ['/admin/vehicles', 'admin-fleet.html'],
  ['/admin/fleet', 'admin-fleet.html'],
  ['/admin/incidents', 'admin-incidents.html'],
  ['/admin/reviews', 'admin-reviews.html'],
  ['/admin/support', 'admin-support.html'],
  ['/admin/settings', 'admin-settings.html'],
  ['/admin/reports', 'admin-reports.html'],
  ['/admin/analytics', 'admin-reports.html'],
  ['/admin/audit', 'admin-audit.html'],
  ['/admin/admins', 'admin-admins.html'],
  ['/admin/verifications', 'admin-verification.html'],
  ['/admin/verification', 'admin-verification.html'],

  ['/driver', 'driver-dashboard.html'],
  ['/driver/dashboard', 'driver-dashboard.html'],
  ['/driver/current-trip', 'driver-current-trip.html'],
  ['/driver/earnings', 'driver-earnings.html'],
  ['/driver/vehicle', 'driver-vehicle.html'],
  ['/driver/available-rides', 'driver-available-rides.html'],
  ['/driver/available-seats', 'driver-available-seats.html'],
  ['/driver/ride-history', 'ride-history.html'],
  ['/driver/profile', 'driver-profile.html'],
  ['/driver/settings', 'driver-settings.html'],
  ['/driver/support', 'driver-support.html'],
  ['/driver/documents', 'driver-vehicle.html'],

  ['/rider', 'rider-dashboard.html'],
  ['/rider/dashboard', 'rider-dashboard.html'],
  ['/rider/book', 'ride-booking.html'],
  ['/rider/booking', 'ride-booking.html'],
  ['/rider/history', 'ride-history.html'],
  ['/rider/payments', 'rider-payments.html'],
  ['/rider/profile', 'rider-profile.html'],
  ['/rider/settings', 'rider-settings.html'],
  ['/rider/support', 'rider-support.html'],
  ['/rider/promotions', 'admin-promotions.html'],
  ['/rider/saved-places', 'ride-booking.html'],
  ['/rider/notifications', 'rider-notifications.html'],
  ['/rider/referrals', 'rider-profile.html'],
];

function PrototypePage({ file }) {
  const src = `${prototypeBase}/${file}`;

  return (
    <main className="prototype-shell">
      <iframe
        className="prototype-frame"
        src={src}
        title={`EasyGo ${file.replace('.html', '')}`}
      />
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map(([path, file]) => (
          <Route key={path} path={path} element={<PrototypePage file={file} />} />
        ))}
        <Route path="/admin-panel" element={<Navigate to="/admin" replace />} />
        <Route path="/rider-dashboard" element={<Navigate to="/rider" replace />} />
        <Route path="/driver-dashboard" element={<Navigate to="/driver" replace />} />
        <Route path="*" element={<PrototypePage file="index.html" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
