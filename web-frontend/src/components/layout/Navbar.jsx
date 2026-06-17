// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, LogOut, Settings, User } from 'lucide-react';
import { logout } from '@/store/slices/authSlice';
import AuthService from '@/services/auth.service';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const user = useSelector(state => state.auth.user);
  const isAuthenticated = useSelector(state => !!state.auth.user);

  const isPublicRoute = ['/', '/login', '/register'].includes(location.pathname);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = isAuthenticated 
    ? user?.role === 'admin'
      ? [
          { label: 'Dashboard', path: '/admin' },
          { label: 'Users', path: '/admin/users' },
          { label: 'Drivers', path: '/admin/drivers' },
          { label: 'Rides', path: '/admin/rides' },
          { label: 'Analytics', path: '/admin/analytics' },
        ]
      : user?.role === 'driver'
      ? [
          { label: 'Dashboard', path: '/driver' },
          { label: 'Current Trip', path: '/driver/current-trip' },
          { label: 'Earnings', path: '/driver/earnings' },
          { label: 'History', path: '/driver/ride-history' },
        ]
      : [
          { label: 'Dashboard', path: '/rider' },
          { label: 'Book Ride', path: '/rider/book' },
          { label: 'History', path: '/rider/history' },
          { label: 'Payments', path: '/rider/payments' },
        ]
    : [
        { label: 'Home', path: '/' },
        { label: 'Features', path: '/#features' },
        { label: 'Pricing', path: '/#pricing' },
        { label: 'Contact', path: '/#contact' },
      ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div 
            className="logo-button"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            <div className="logo-icon">🚖</div>
            <span className="logo-text">EasyGo</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-desktop">
          <div className="nav-links">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.path);
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            {isAuthenticated ? (
              <div className="profile-menu">
                <button 
                  className="profile-button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="profile-avatar">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} />
                    ) : (
                      <span>{user?.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <span className="profile-name">{user?.name || 'User'}</span>
                </button>

                {isProfileOpen && (
                  <div className="profile-dropdown">
                    <a 
                      href={user?.role === 'admin' ? '/admin/settings' : `//${user?.role}/profile`}
                      className="dropdown-link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(user?.role === 'admin' ? '/admin/settings' : `/${user?.role}/profile`);
                        setIsProfileOpen(false);
                      }}
                    >
                      <User size={16} />
                      Profile
                    </a>
                    <a 
                      href={user?.role === 'admin' ? '/admin/settings' : `/${user?.role}/settings`}
                      className="dropdown-link"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(user?.role === 'admin' ? '/admin/settings' : `/${user?.role}/settings`);
                        setIsProfileOpen(false);
                      }}
                    >
                      <Settings size={16} />
                      Settings
                    </a>
                    <button 
                      className="dropdown-link logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button 
                  className="btn btn-outline"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="nav-mobile">
          <div className="mobile-nav-links">
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                className="mobile-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.path);
                  setIsOpen(false);
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mobile-nav-actions">
            {isAuthenticated ? (
              <button 
                className="btn btn-mobile-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <>
                <button 
                  className="btn btn-mobile-secondary"
                  onClick={() => {
                    navigate('/login');
                    setIsOpen(false);
                  }}
                >
                  Sign In
                </button>
                <button 
                  className="btn btn-mobile-primary"
                  onClick={() => {
                    navigate('/register');
                    setIsOpen(false);
                  }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
