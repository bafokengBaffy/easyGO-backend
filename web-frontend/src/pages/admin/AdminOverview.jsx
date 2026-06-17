import React from 'react';
import '../AdminAudit.css'; // Reusing the professional audit styles

const AdminOverview = () => {
  return (
    <div className="admin-audit-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Platform Overview</h1>
          <p>Real-time monitoring of users, rides, and revenue</p>
        </div>
        <div className="action-bar">
          <button className="export-btn"><i className="fas fa-sync"></i> Refresh Data</button>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card" style={{borderLeftColor: '#F5C400'}}>
          <h3>Total Revenue</h3>
          <div className="stat-number">R45,230</div>
          <div className="stat-trend text-success">↑ 8% this week</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: '#28a745'}}>
          <h3>Active Rides</h3>
          <div className="stat-number">124</div>
          <div className="stat-trend">Live in transit</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: '#17a2b8'}}>
          <h3>New Drivers</h3>
          <div className="stat-number">12</div>
          <div className="stat-trend">Pending approval</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: '#dc3545'}}>
          <h3>Support Tickets</h3>
          <div className="stat-number">5</div>
          <div className="stat-trend text-danger">High priority</div>
        </div>
      </div>

      <div className="data-table">
        <div className="section-header" style={{padding: '20px'}}>
          <h2>Recent System Activity</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Entity</th>
              <th>Action</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-06-09 14:22</td>
              <td>User #882</td>
              <td>New Registration</td>
              <td><span className="badge badge-success">Success</span></td>
            </tr>
            <tr>
              <td>2026-06-09 14:15</td>
              <td>Ride #RT-112</td>
              <td>Payment Processed</td>
              <td><span className="badge badge-info">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOverview;