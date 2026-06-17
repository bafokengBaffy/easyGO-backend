import React, { useState, useEffect } from 'react';
import './DriverDashboard.css';

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [availableRides, setAvailableRides] = useState([
    { id: 'R-9921', pickup: 'Sandton City, JHB', dropoff: 'OR Tambo Airport', fare: 'R350', distance: '22km' },
    { id: 'R-9925', pickup: 'Rosebank Mall', dropoff: 'Soweto, Vilakazi St', fare: 'R180', distance: '15km' },
  ]);

  const toggleStatus = () => setIsOnline(!isOnline);

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Driver Console</h1>
          <p>Manage your availability and track your daily earnings</p>
        </div>
        <div className="action-bar">
          <button 
            className={`status-toggle-btn ${isOnline ? 'online' : 'offline'}`}
            onClick={toggleStatus}
          >
            <i className={`fas fa-${isOnline ? 'signal' : 'power-off'}`}></i>
            {isOnline ? 'YOU ARE ONLINE' : 'GO ONLINE'}
          </button>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <h3>Today's Earnings</h3>
          <div className="stat-number">R1,240.50</div>
          <div className="stat-trend text-success">↑ 12% from yesterday</div>
        </div>
        <div className="stat-card">
          <h3>Trips Completed</h3>
          <div className="stat-number">8</div>
          <div className="stat-trend">Target: 10</div>
        </div>
        <div className="stat-card">
          <h3>Driver Rating</h3>
          <div className="stat-number">4.92</div>
          <div className="stat-trend">⭐ Gold Tier</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="data-table">
          <div className="section-header">
            <h2>Available Requests</h2>
            {isOnline && <span className="pulse-indicator">Scanning...</span>}
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Pickup</th>
                <th>Dropoff</th>
                <th>Fare</th>
                <th>Distance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isOnline ? (
                availableRides.map(ride => (
                  <tr key={ride.id}>
                    <td><strong>{ride.id}</strong></td>
                    <td>{ride.pickup}</td>
                    <td>{ride.dropoff}</td>
                    <td><span className="fare-tag">{ride.fare}</span></td>
                    <td>{ride.distance}</td>
                    <td>
                      <button className="action-btn accept">Accept</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <i className="fas fa-moon"></i>
                    <p>Go online to start receiving ride requests</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;