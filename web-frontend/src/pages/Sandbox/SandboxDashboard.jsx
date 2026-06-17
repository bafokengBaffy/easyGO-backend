import React, { useState, useEffect } from 'react';
import MpesaSimulator from './MpesaSimulator';
import EcoCashSimulator from './EcoCashSimulator';
import TransactionMonitor from './TransactionMonitor';
import TestScenarios from './TestScenarios';
import sandboxService from '../../services/sandboxService';
import './SandboxDashboard.css';

const SandboxDashboard = () => {
  const [activeTab, setActiveTab] = useState('mpesa');
  const [stats, setStats] = useState({ mpesa: {}, ecocash: {} });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await sandboxService.getStatus();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      showNotification('Failed to load sandbox stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const resetSimulation = async (provider) => {
    if (window.confirm(`Reset ${provider} simulator? This will clear all transactions.`)) {
      try {
        await sandboxService.resetSimulation(provider);
        showNotification(`${provider} simulator reset successfully`, 'success');
        loadStats();
      } catch (error) {
        showNotification(`Failed to reset ${provider} simulator`, 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="sandbox-loading">
        <div className="spinner"></div>
        <p>Loading Sandbox Environment...</p>
      </div>
    );
  }

  return (
    <div className="sandbox-dashboard">
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="sandbox-header">
        <div>
          <h1>🏪 Payment Sandbox</h1>
          <p>Test M-Pesa and EcoCash integrations in a safe environment</p>
        </div>
        <div className="sandbox-badge">
          🔬 SANDBOX MODE
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-info">
            <h3>M-Pesa Transactions</h3>
            <div className="stat-numbers">
              <span>Total: {stats.mpesa?.totalTransactions || 0}</span>
              <span className="success">✓ {stats.mpesa?.completed || 0}</span>
              <span className="failed">✗ {stats.mpesa?.failed || 0}</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>EcoCash Transactions</h3>
            <div className="stat-numbers">
              <span>Total: {stats.ecocash?.totalTransactions || 0}</span>
              <span className="success">✓ {stats.ecocash?.success || 0}</span>
              <span className="failed">✗ {stats.ecocash?.failed || 0}</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <h3>Active Sessions</h3>
            <div className="stat-numbers">
              <span>M-Pesa: {stats.mpesa?.activeCallbacks || 0}</span>
              <span>EcoCash: {stats.ecocash?.activeSessions || 0}</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-info">
            <h3>Test Balance</h3>
            <div className="stat-numbers">
              <span>M: M{stats.mpesa?.customerBalance?.toLocaleString() || 0}</span>
              <span>E: M{stats.ecocash?.customerBalance?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sandbox-tabs">
        <button 
          className={activeTab === 'mpesa' ? 'active' : ''} 
          onClick={() => setActiveTab('mpesa')}
        >
          📱 M-Pesa Lesotho
        </button>
        <button 
          className={activeTab === 'ecocash' ? 'active' : ''} 
          onClick={() => setActiveTab('ecocash')}
        >
          💰 EcoCash Lesotho
        </button>
        <button 
          className={activeTab === 'transactions' ? 'active' : ''} 
          onClick={() => setActiveTab('transactions')}
        >
          📊 Transaction Monitor
        </button>
        <button 
          className={activeTab === 'scenarios' ? 'active' : ''} 
          onClick={() => setActiveTab('scenarios')}
        >
          🧪 Test Scenarios
        </button>
      </div>

      <div className="sandbox-content">
        {activeTab === 'mpesa' && (
          <MpesaSimulator onNotify={showNotification} stats={stats.mpesa} />
        )}
        {activeTab === 'ecocash' && (
          <EcoCashSimulator onNotify={showNotification} stats={stats.ecocash} />
        )}
        {activeTab === 'transactions' && (
          <TransactionMonitor onNotify={showNotification} />
        )}
        {activeTab === 'scenarios' && (
          <TestScenarios onNotify={showNotification} />
        )}
      </div>

      <div className="sandbox-footer">
        <button onClick={() => resetSimulation('MPESA')} className="btn-danger">
          Reset M-Pesa
        </button>
        <button onClick={() => resetSimulation('ECOCASH')} className="btn-danger">
          Reset EcoCash
        </button>
        <button onClick={() => resetSimulation('BOTH')} className="btn-warning">
          Reset Both
        </button>
        <button onClick={loadStats} className="btn-info">
          Refresh Stats
        </button>
      </div>
    </div>
  );
};

export default SandboxDashboard;