import React, { useState } from 'react';
import './RiderDashboard.css';

const RiderDashboard = () => {
  const [booking, setBooking] = useState({ pickup: '', dropoff: '', type: 'standard' });

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Where to, Baokeng?</h1>
          <p>Book a ride or schedule a trip for later</p>
        </div>
      </div>

      <div className="rider-layout">
        <div className="booking-card">
          <div className="booking-inputs">
            <div className="input-group">
              <i className="fas fa-circle-dot pickup-icon"></i>
              <input 
                type="text" 
                placeholder="Enter pickup location" 
                value={booking.pickup}
                onChange={(e) => setBooking({...booking, pickup: e.target.value})}
              />
            </div>
            <div className="input-divider"></div>
            <div className="input-group">
              <i className="fas fa-location-pin dropoff-icon"></i>
              <input 
                type="text" 
                placeholder="Where to?" 
                value={booking.dropoff}
                onChange={(e) => setBooking({...booking, dropoff: e.target.value})}
              />
            </div>
          </div>

          <div className="vehicle-selection">
            <div className={`veh-option ${booking.type === 'standard' ? 'active' : ''}`} onClick={() => setBooking({...booking, type: 'standard'})}>
              <i className="fas fa-car"></i>
              <span>EasyGo</span>
              <small>Affordable</small>
            </div>
            <div className={`veh-option ${booking.type === 'premium' ? 'active' : ''}`} onClick={() => setBooking({...booking, type: 'premium'})}>
              <i className="fas fa-car-side"></i>
              <span>Premium</span>
              <small>Luxury</small>
            </div>
          </div>

          <button className="confirm-btn">Confirm EasyGo</button>
        </div>

        <div className="history-summary">
          <div className="section-header">
            <h2>Recent Trips</h2>
            <button className="view-all">View All</button>
          </div>
          <div className="trip-list">
            {[
              { date: 'Today, 10:30 AM', addr: '12 Cape Rd', price: 'R85.00', status: 'Completed' },
              { date: 'Yesterday, 6:15 PM', addr: 'Mall of Africa', price: 'R120.00', status: 'Completed' }
            ].map((trip, i) => (
              <div key={i} className="trip-item">
                <div className="trip-info">
                  <span className="trip-date">{trip.date}</span>
                  <span className="trip-addr">{trip.addr}</span>
                </div>
                <div className="trip-meta">
                  <span className="trip-price">{trip.price}</span>
                  <span className="badge badge-success">{trip.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;