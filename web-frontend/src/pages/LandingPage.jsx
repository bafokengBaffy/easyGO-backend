import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navigation matching App.test.jsx requirements */}
      <nav className="landing-nav">
        <div className="logo">EasyGo</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/login" className="nav-btn">Login</Link>
          <Link to="/register" className="nav-btn primary">Register</Link>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-content">
          <h1>Build modern ride and fleet experiences fast.</h1>
          <p>The premium choice for reliable, safe, and gold-standard transportation services in South Africa.</p>
          <div className="hero-actions">
            <Link to="/register" className="cta-btn">Get Started</Link>
            <button className="secondary-btn">Learn More</button>
          </div>
        </div>
      </header>

      {/* New Gold Tier Benefits Section */}
      <section className="gold-tier-section">
        <div className="section-title">
          <span className="badge">Exclusive</span>
          <h2>The EasyGo Gold Standard</h2>
          <p>Our Gold Tier is designed for our top-performing partners and frequent riders.</p>
        </div>

        <div className="gold-grid">
          <div className="gold-card">
            <div className="icon-wrapper">
              <i className="fas fa-coins"></i>
            </div>
            <h3>15% Higher Earnings</h3>
            <p>Gold Tier drivers enjoy a significantly lower commission rate, putting more money in your pocket every trip.</p>
          </div>

          <div className="gold-card">
            <div className="icon-wrapper">
              <i className="fas fa-bolt"></i>
            </div>
            <h3>Instant Payouts</h3>
            <p>Access your earnings immediately. No more waiting for weekly cycles—withdraw your balance anytime.</p>
          </div>

          <div className="gold-card">
            <div className="icon-wrapper">
              <i className="fas fa-shield-halved"></i>
            </div>
            <h3>Priority Dispatch</h3>
            <p>Get first preference for high-value ride requests in busy zones and airport transfers.</p>
          </div>

          <div className="gold-card">
            <div className="icon-wrapper">
              <i className="fas fa-headset"></i>
            </div>
            <h3>24/7 Dedicated Support</h3>
            <p>Skip the queue with a dedicated support line for Gold Tier members, ensuring fast resolution to any issue.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>EasyGo</h3>
            <p>Redefining South African Mobility.</p>
          </div>
          <div className="footer-bottom">
            &copy; 2026 EasyGo Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;