// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronRight, Menu, X } from 'lucide-react';
import './Sidebar.css';

const ADMIN_MENU = [
  {
    label: 'Dashboard',
    path: '/admin',
    icon: '📊',
    children: [],
  },
  {
    label: 'Management',
    icon: '⚙️',
    children: [
      { label: 'Users', path: '/admin/users', icon: '👥' },
      { label: 'Drivers', path: '/admin/drivers', icon: '🚗' },
      { label: 'Riders', path: '/admin/users', icon: '👤' },
      { label: 'Vehicles', path: '/admin/vehicles', icon: '🚙' },
    ],
  },
  {
    label: 'Operations',
    icon: '🎯',
    children: [
      { label: 'Rides', path: '/admin/rides', icon: '🚕' },
      { label: 'Zones', path: '/admin/zones', icon: '🗺️' },
      { label: 'Incidents', path: '/admin/incidents', icon: '⚠️' },
      { label: 'Fleet', path: '/admin/fleet', icon: '📦' },
    ],
  },
  {
    label: 'Financials',
    icon: '💰',
    children: [
      { label: 'Payments', path: '/admin/payments', icon: '💳' },
      { label: 'Payouts', path: '/admin/payouts', icon: '💸' },
      { label: 'Promotions', path: '/admin/promotions', icon: '🎁' },
      { label: 'Invoices', path: '/admin/invoices', icon: '📄' },
    ],
  },
  {
    label: 'Analytics',
    path: '/admin/analytics',
    icon: '📈',
    children: [],
  },
  {
    label: 'Support',
    icon: '🤝',
    children: [
      { label: 'Tickets', path: '/admin/support', icon: '🎫' },
      { label: 'Reviews', path: '/admin/reviews', icon: '⭐' },
      { label: 'Feedback', path: '/admin/feedback', icon: '💬' },
    ],
  },
  {
    label: 'System',
    icon: '🔧',
    children: [
      { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
      { label: 'Audit Logs', path: '/admin/audit', icon: '📋' },
      { label: 'Verifications', path: '/admin/verifications', icon: '✅' },
    ],
  },
];

const DRIVER_MENU = [
  { label: 'Dashboard', path: '/driver', icon: '🏠' },
  { label: 'Current Trip', path: '/driver/current-trip', icon: '🚗' },
  { label: 'Available Rides', path: '/driver/available-rides', icon: '📍' },
  { label: 'Earnings', path: '/driver/earnings', icon: '💰' },
  { label: 'History', path: '/driver/ride-history', icon: '📜' },
  { label: 'Vehicle', path: '/driver/vehicle', icon: '🚙' },
  { label: 'Profile', path: '/driver/profile', icon: '👤' },
  { label: 'Settings', path: '/driver/settings', icon: '⚙️' },
  { label: 'Support', path: '/driver/support', icon: '🤝' },
];

const RIDER_MENU = [
  { label: 'Dashboard', path: '/rider', icon: '🏠' },
  { label: 'Book Ride', path: '/rider/book', icon: '🚕' },
  { label: 'History', path: '/rider/history', icon: '📜' },
  { label: 'Saved Places', path: '/rider/saved-places', icon: '📍' },
  { label: 'Payments', path: '/rider/payments', icon: '💳' },
  { label: 'Promotions', path: '/rider/promotions', icon: '🎁' },
  { label: 'Notifications', path: '/rider/notifications', icon: '🔔' },
  { label: 'Profile', path: '/rider/profile', icon: '👤' },
  { label: 'Settings', path: '/rider/settings', icon: '⚙️' },
  { label: 'Support', path: '/rider/support', icon: '🤝' },
];

function SidebarItem({ item, isActive, onClick, isExpanded, onToggle }) {
  return (
    <>
      <button
        className={`sidebar-item ${isActive ? 'active' : ''} ${item.children?.length > 0 ? 'has-children' : ''}`}
        onClick={() => {
          if (item.children?.length > 0) {
            onToggle();
          } else {
            onClick(item.path);
          }
        }}
      >
        <span className="sidebar-item-icon">{item.icon}</span>
        <span className="sidebar-item-label">{item.label}</span>
        {item.children?.length > 0 && (
          <ChevronRight
            size={16}
            className={`sidebar-item-chevron ${isExpanded ? 'expanded' : ''}`}
          />
        )}
      </button>

      {item.children?.length > 0 && isExpanded && (
        <div className="sidebar-children">
          {item.children.map((child) => (
            <button
              key={child.path}
              className={`sidebar-child-item ${isActive === child.path ? 'active' : ''}`}
              onClick={() => onClick(child.path)}
            >
              <span className="sidebar-child-icon">{child.icon}</span>
              <span className="sidebar-child-label">{child.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(state => state.auth.user);
  const [isOpen, setIsOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});

  const getMenuForRole = () => {
    if (user?.role === 'admin') return ADMIN_MENU;
    if (user?.role === 'driver') return DRIVER_MENU;
    return RIDER_MENU;
  };

  const menu = getMenuForRole();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const toggleExpand = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h3>Menu</h3>
          </div>

          <nav className="sidebar-menu">
            {menu.map((item, index) => (
              <SidebarItem
                key={index}
                item={item}
                isActive={location.pathname === item.path}
                onClick={handleNavigate}
                isExpanded={expandedItems[index]}
                onToggle={() => toggleExpand(index)}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
