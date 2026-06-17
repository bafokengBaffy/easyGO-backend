import React, { useState, useEffect } from 'react';
import sandboxService from '../../services/sandboxService';

const MpesaSimulator = ({ onNotify, stats }) => {
  const [formData, setFormData] = useState({
    amount: 100,
    phone: '26650000001',
    reference: `TEST_${Date.now()}`,
    description: 'Test Payment'
  });
  const [testAccounts, setTestAccounts] = useState([]);
  const [simulationConfig, setSimulationConfig] = useState({
    delay: 2000,
    failureRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);

  useEffect(() => {
    loadTestAccounts();
  }, []);

  const loadTestAccounts = async () => {
    try {
      const response = await sandboxService.getTestAccounts();
      if (response.data?.mpesa) {
        setTestAccounts(response.data.mpesa);
      }
    } catch (error) {
      console.error('Failed to load test accounts:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleConfigChange = (e) => {
    const value = e.target.name === 'failureRate' ? parseFloat(e.target.value) : parseInt(e.target.value);
    setSimulationConfig({
      ...simulationConfig,
      [e.target.name]: value
    });
  };

  const applyConfig = async () => {
    try {
      await sandboxService.configureSimulation('MPESA', simulationConfig.delay, simulationConfig.failureRate);
      onNotify(`M-Pesa simulation configured: ${simulationConfig.delay}ms delay, ${simulationConfig.failureRate * 100}% failure rate`, 'success');
    } catch (error) {
      onNotify('Failed to configure simulation', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTransactionResult(null);
    
    try {
      const result = await sandboxService.testMpesaPayment(
        formData.amount,
        formData.phone,
        formData.reference
      );
      
      setTransactionResult({
        success: true,
        data: result,
        message: 'Payment initiated successfully'
      });
      
      onNotify(`M-Pesa payment of M${formData.amount} initiated`, 'success');
    } catch (error) {
      setTransactionResult({
        success: false,
        message: error.message
      });
      onNotify(`Payment failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const queryTransaction = async (checkoutId) => {
    // This would need an endpoint to query specific transaction
    onNotify('Query transaction - implement endpoint', 'info');
  };

  const selectTestAccount = (phone) => {
    setFormData({ ...formData, phone });
  };

  return (
    <div className="simulator-container">
      <div className="simulator-section">
        <h2>📱 M-Pesa Lesotho Simulator</h2>
        <p className="simulator-desc">Simulate STK Push payments for testing</p>
        
        <div className="simulation-controls">
          <h3>⚙️ Simulation Parameters</h3>
          <div className="control-group">
            <label>
              Response Delay (ms):
              <input
                type="number"
                name="delay"
                value={simulationConfig.delay}
                onChange={handleConfigChange}
                min="500"
                max="30000"
                step="500"
              />
            </label>
            <label>
              Failure Rate (%):
              <input
                type="range"
                name="failureRate"
                value={simulationConfig.failureRate}
                onChange={handleConfigChange}
                min="0"
                max="1"
                step="0.05"
              />
              <span>{Math.round(simulationConfig.failureRate * 100)}%</span>
            </label>
            <button onClick={applyConfig} className="btn-primary">
              Apply Config
            </button>
          </div>
        </div>

        <div className="test-accounts">
          <h3>📞 Test Accounts</h3>
          <div className="account-list">
            {testAccounts.map((account, idx) => (
              <div key={idx} className="account-card" onClick={() => selectTestAccount(account.phone)}>
                <div className="account-phone">{account.phone}</div>
                <div className="account-name">{account.name}</div>
                <div className="account-balance">M{account.balance?.toLocaleString()}</div>
                <div className="account-pin">PIN: {account.pin}</div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <h3>💸 Initiate STK Push</h3>
          
          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="26650000001"
              required
            />
            <small>Format: 2665XXXXXXX or local 5XXXXXXX</small>
          </div>

          <div className="form-group">
            <label>Amount (M):</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              min="1"
              max="50000"
              step="10"
              required
            />
          </div>

          <div className="form-group">
            <label>Reference:</label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleInputChange}
              placeholder="Order #12345"
              required
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Payment description"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Processing...' : '💳 Simulate STK Push'}
          </button>
        </form>

        {transactionResult && (
          <div className={`transaction-result ${transactionResult.success ? 'success' : 'error'}`}>
            <h4>{transactionResult.success ? '✅ Transaction Initiated' : '❌ Transaction Failed'}</h4>
            <pre>{JSON.stringify(transactionResult.data, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="simulator-sidebar">
        <div className="info-card">
          <h3>📊 M-Pesa Stats</h3>
          <div className="stat-row">
            <span>Total Transactions:</span>
            <strong>{stats?.totalTransactions || 0}</strong>
          </div>
          <div className="stat-row">
            <span>Completed:</span>
            <strong className="text-success">{stats?.completed || 0}</strong>
          </div>
          <div className="stat-row">
            <span>Failed:</span>
            <strong className="text-danger">{stats?.failed || 0}</strong>
          </div>
          <div className="stat-row">
            <span>Cancelled:</span>
            <strong>{stats?.cancelled || 0}</strong>
          </div>
          <div className="stat-row">
            <span>Pending:</span>
            <strong>{stats?.pending || 0}</strong>
          </div>
        </div>

        <div className="info-card">
          <h3>📖 How to Test</h3>
          <ol>
            <li>Select a test account or enter phone number</li>
            <li>Enter payment amount (M1 - M50,000)</li>
            <li>Click "Simulate STK Push"</li>
            <li>Transaction processes with configured delay</li>
            <li>Check result and monitor webhook</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default MpesaSimulator;