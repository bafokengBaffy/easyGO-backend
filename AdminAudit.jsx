import React, { useState, useMemo } from 'react';
import './AdminAudit.css';

const MOCK_LOGS = [
  { id: 1, ts: '2026-02-17 09:23:45', admin: 'Bongani M.', action: 'LOGIN', desc: 'Successful login from admin panel', ip: '192.168.1.45', status: 'success', avatar: 'BM' },
  { id: 2, ts: '2026-02-17 08:12:10', admin: 'Lerato M.', action: 'UPDATE', desc: 'Modified driver payout rate for region JHB', ip: '10.0.0.23', status: 'success', avatar: 'LM' },
  { id: 3, ts: '2026-02-16 22:45:03', admin: 'System', action: 'SECURITY', desc: 'Failed login attempt (invalid MFA)', ip: '45.123.32.11', status: 'failed', avatar: 'SY' },
  { id: 4, ts: '2026-02-16 16:30:22', admin: 'Thabo N.', action: 'CREATE', desc: 'New promotion code SUMMER21 created', ip: '192.168.1.102', status: 'success', avatar: 'TN' },
  { id: 5, ts: '2026-02-16 11:05:47', admin: 'Bongani M.', action: 'DELETE', desc: 'Removed expired driver document #D-8823', ip: '192.168.1.45', status: 'success', avatar: 'BM' },
  { id: 6, ts: '2026-02-15 14:19:33', admin: 'Nosipho K.', action: 'SETTINGS', desc: 'Changed company support email', ip: '10.0.0.78', status: 'success', avatar: 'NK' },
  { id: 7, ts: '2026-02-15 10:02:11', admin: 'System', action: 'AUDIT', desc: 'Audit log retention policy executed', ip: '127.0.0.1', status: 'info', avatar: 'SY' },
  { id: 8, ts: '2026-02-14 23:14:56', admin: 'Lerato M.', action: 'LOGIN', desc: 'Logout (session expiry)', ip: '10.0.0.23', status: 'info', avatar: 'LM' },
  { id: 9, ts: '2026-02-14 18:47:21', admin: 'Bongani M.', action: 'UPDATE', desc: 'Updated zone fares (CPT)', ip: '192.168.1.45', status: 'success', avatar: 'BM' },
  { id: 10, ts: '2026-02-14 09:30:02', admin: 'Thabo N.', action: 'VERIFY', desc: 'Approved driver license #DL-4421', ip: '192.168.1.102', status: 'success', avatar: 'TN' },
];

const AdminAudit = () => {
  const [logs] = useState(MOCK_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({ actionType: '', user: '', start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const rowsPerPage = 7;

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = !searchTerm || 
        log.desc.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.admin.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.ip.includes(searchTerm);
      
      const matchesAction = !filters.actionType || log.action === filters.actionType;
      const matchesUser = !filters.user || log.admin.toLowerCase().includes(filters.user.toLowerCase());
      const matchesDate = (!filters.start || log.ts.split(' ')[0] >= filters.start) &&
                          (!filters.end || log.ts.split(' ')[0] <= filters.end);

      return matchesSearch && matchesAction && matchesUser && matchesDate;
    });
  }, [logs, searchTerm, filters]);

  const paginatedLogs = filteredLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);

  const getStatusBadgeClass = (log) => {
    if (log.status === 'failed' || log.status === 'danger') return 'badge-danger';
    if (log.status === 'info') return 'badge-info';
    if (log.action === 'DELETE') return 'badge-warning';
    return 'badge-success';
  };

  return (
    <div className="admin-audit-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Audit Logs</h1>
          <p>Comprehensive trail of all administrative actions and system events</p>
        </div>
        <div className="action-bar">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search by user, action, or IP..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="filter-btn" onClick={() => setIsFilterVisible(!isFilterVisible)}>
            <i className="fas fa-filter"></i> Filters
          </button>
          <button className="export-btn"><i className="fas fa-download"></i> Export</button>
        </div>
      </div>

      {isFilterVisible && (
        <div className="filter-bar-container">
          <div className="filter-bar">
            <select className="filter-select" onChange={(e) => setFilters({...filters, actionType: e.target.value})}>
              <option value="">All action types</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
              <option value="SETTINGS">SETTINGS</option>
            </select>
            <input 
              type="date" 
              className="date-input" 
              onChange={(e) => setFilters({...filters, start: e.target.value})} 
            />
            <span>—</span>
            <input 
              type="date" 
              className="date-input" 
              onChange={(e) => setFilters({...filters, end: e.target.value})} 
            />
            <button className="action-btn reset" onClick={() => setFilters({ actionType: '', user: '', start: '', end: '' })}>Reset</button>
          </div>
        </div>
      )}

      <div className="stats-cards">
        <div className="stat-card"><h3>Total Events</h3><div className="stat-number">{filteredLogs.length}</div><div className="stat-trend">Live count</div></div>
        <div className="stat-card"><h3>Unique Users</h3><div className="stat-number">24</div><div className="stat-trend">active admins</div></div>
        <div className="stat-card"><h3>Security Events</h3><div className="stat-number">32</div><div className="stat-trend">⚠️ 2 failed logins</div></div>
      </div>

      <div className="data-table">
        <table id="auditTable">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin / User</th>
              <th>Action Type</th>
              <th>Description</th>
              <th>IP Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map(log => (
              <tr key={log.id}>
                <td>{log.ts}</td>
                <td>
                  <div className="user-cell">
                    <span className="avatar-icon">{log.avatar}</span> {log.admin}
                  </div>
                </td>
                <td><span className={`badge ${getStatusBadgeClass(log)}`}>{log.action}</span></td>
                <td>{log.desc}</td>
                <td>{log.ip}</td>
                <td><span className={`badge ${getStatusBadgeClass(log)}`}>{log.status}</span></td>
                <td>
                  <button className="action-btn view" onClick={() => setSelectedLog(log)}>
                    <i className="fas fa-eye"></i> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button 
            className="page-item" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i} 
              className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button 
            className="page-item" 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {selectedLog && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Audit Log Details #{selectedLog.id}</h2>
              <button className="close-modal" onClick={() => setSelectedLog(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <p><strong>Timestamp:</strong> {selectedLog.ts}</p>
                <p><strong>Admin:</strong> {selectedLog.admin}</p>
                <p><strong>Action:</strong> <span className="badge badge-info">{selectedLog.action}</span></p>
                <p><strong>Description:</strong> {selectedLog.desc}</p>
                <p><strong>IP address:</strong> {selectedLog.ip}</p>
                <p><strong>Status:</strong> {selectedLog.status}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedLog(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAudit;