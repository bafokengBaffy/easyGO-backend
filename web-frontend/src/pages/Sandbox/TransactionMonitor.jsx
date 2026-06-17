import React, { useState, useEffect } from 'react';
import sandboxService from '../../services/sandboxService';

const TransactionMonitor = ({ onNotify }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ provider: '', status: '' });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadTransactions();
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadTransactions, 5000);
    }
    return () => clearInterval(interval);
  }, [filter, autoRefresh]);

  const loadTransactions = async () => {
    try {
      const response = await sandboxService.getTransactions(
        filter.provider || null,
        filter.status || null,
        100,
        0
      );
      if (response.data) {
        setTransactions(response.data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      'PENDING': 'status-pending',
      'COMPLETED': 'status-completed',
      'SUCCESS': 'status-completed',
      'FAILED': 'status-failed',
      'CANCELLED': 'status-cancelled',
      'TIMEOUT': 'status-timeout'
    };
    return classes[status] || 'status-pending';
  };

  const getStatusText = (status) => {
    const texts = {
      'PENDING': '⏳ Pending',
      'COMPLETED': '✅ Completed',
      'SUCCESS': '✅ Success',
      'FAILED': '❌ Failed',
      'CANCELLED': '🚫 Cancelled',
      'TIMEOUT': '⏰ Timeout',
      'REVERSED': '↩️ Reversed'
    };
    return texts[status] || status;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-LS', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatAmount = (amount, currency = 'LSL') => {
    return new Intl.NumberFormat('en-LS', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const simulateWebhook = async (transaction) => {
    if (window.confirm(`Simulate webhook for transaction ${transaction.id || transaction.transactionId}?`)) {
      try {
        await sandboxService.simulateWebhook(
          transaction.id || transaction.transactionId,
          transaction.provider,
          'payment'
        );
        onNotify('Webhook simulation triggered', 'success');
        loadTransactions();
      } catch (error) {
        onNotify('Failed to simulate webhook', 'error');
      }
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading transactions...</div>;
  }

  return (
    <div className="transaction-monitor">
      <div className="monitor-header">
        <h2>📊 Transaction Monitor</h2>
        <div className="monitor-controls">
          <label>
            Auto-refresh:
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
          </label>
          <button onClick={loadTransactions} className="btn-refresh">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <select
          value={filter.provider}
          onChange={(e) => setFilter({ ...filter, provider: e.target.value })}
        >
          <option value="">All Providers</option>
          <option value="MPESA">M-Pesa</option>
          <option value="ECOCASH">EcoCash</option>
        </select>

        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="TIMEOUT">Timeout</option>
        </select>

        <button onClick={() => setFilter({ provider: '', status: '' })} className="btn-clear">
          Clear Filters
        </button>
      </div>

      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Provider</th>
              <th>Transaction ID</th>
              <th>Amount</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => (
                <tr key={idx} onClick={() => setSelectedTransaction(tx)}>
                  <td>{formatDate(tx.createdAt)}</td>
                  <td>
                    <span className={`provider-badge provider-${tx.provider?.toLowerCase()}`}>
                      {tx.provider}
                    </span>
                  </td>
                  <td className="tx-id">
                    {(tx.transactionId || tx.id)?.substring(0, 20)}...
                  </td>
                  <td className="tx-amount">{formatAmount(tx.amount)}</td>
                  <td>{tx.phoneNumber || tx.customerMsisdn || tx.phone}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(tx.status)}`}>
                      {getStatusText(tx.status)}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        simulateWebhook(tx);
                      }}
                      className="btn-small"
                    >
                      🔔 Simulate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedTransaction && (
        <div className="transaction-detail-modal" onClick={() => setSelectedTransaction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Transaction Details</h3>
              <button onClick={() => setSelectedTransaction(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Transaction ID:</strong>
                <code>{selectedTransaction.transactionId || selectedTransaction.id}</code>
              </div>
              <div className="detail-row">
                <strong>Provider:</strong>
                <span>{selectedTransaction.provider}</span>
              </div>
              <div className="detail-row">
                <strong>Amount:</strong>
                <span>{formatAmount(selectedTransaction.amount)}</span>
              </div>
              <div className="detail-row">
                <strong>Phone:</strong>
                <span>{selectedTransaction.phoneNumber || selectedTransaction.customerMsisdn}</span>
              </div>
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={getStatusClass(selectedTransaction.status)}>
                  {getStatusText(selectedTransaction.status)}
                </span>
              </div>
              <div className="detail-row">
                <strong>Created:</strong>
                <span>{formatDate(selectedTransaction.createdAt)}</span>
              </div>
              {selectedTransaction.completedAt && (
                <div className="detail-row">
                  <strong>Completed:</strong>
                  <span>{formatDate(selectedTransaction.completedAt)}</span>
                </div>
              )}
              {selectedTransaction.metadata && (
                <div className="detail-row">
                  <strong>Metadata:</strong>
                  <pre>{JSON.stringify(selectedTransaction.metadata, null, 2)}</pre>
                </div>
              )}
              {selectedTransaction.error && (
                <div className="detail-row error">
                  <strong>Error:</strong>
                  <pre>{JSON.stringify(selectedTransaction.error, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="stats-summary">
        <div className="stat-box">
          <span>Total Transactions:</span>
          <strong>{transactions.length}</strong>
        </div>
        <div className="stat-box">
          <span>Total Volume:</span>
          <strong>
            {formatAmount(transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0))}
          </strong>
        </div>
        <div className="stat-box">
          <span>Success Rate:</span>
          <strong>
            {Math.round(
              (transactions.filter(tx => tx.status === 'COMPLETED' || tx.status === 'SUCCESS').length /
                transactions.length) * 100
            ) || 0}%
          </strong>
        </div>
      </div>
    </div>
  );
};

export default TransactionMonitor;