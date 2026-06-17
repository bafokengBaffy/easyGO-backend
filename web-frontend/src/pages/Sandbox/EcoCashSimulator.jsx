import React, { useState, useEffect } from 'react';
import sandboxService from '../../services/sandboxService';

const EcoCashSimulator = ({ onNotify, stats }) => {
  const [formData, setFormData] = useState({
    amount: 100,
    phone: '26650000001',
    reference: `EC_${Date.now()}`,
    description: 'Test Payment',
    pin: '1234'
  });
  const [testAccounts, setTestAccounts] = useState([]);
  const [simulationConfig, setSimulationConfig] = useState({
    delay: 3000,
    failureRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [transactionResult, setTransactionResult] = useState(null);

  useEffect(() => {
    loadTestAccounts();
  }, []);

  const loadTestAccounts = async () => {
    try {
      const response = await sandboxService.getTestAccounts();
      if (response.data?.ecocash) {
        setTestAccounts(response.data.ecocash);
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
      await sandboxService.configureSimulation('ECOCASH', simulationConfig.delay, simulationConfig.failureRate);
      onNotify(`EcoCash simulation configured: ${simulationConfig.delay}ms delay, ${simulationConfig.failureRate * 100}% failure rate`, 'success');
    } catch (error) {
      onNotify('Failed to configure simulation', 'error');
    }
  };

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTransactionResult(null);
    
    try {
      const result = await sandboxService.testEcoCashPayment(
        formData.amount,
        formData.phone,
        formData.reference
      );
      
      setPendingTransaction({
        transactionId: result.transactionId,
        amount: formData.amount,
        phone: formData.phone,
        reference: formData.reference,
        paymentUrl: result.paymentUrl
      });
      
      setTransactionResult({
        success: true,
        data: result,
        message: 'Payment initiated, waiting for PIN confirmation'
      });
      
      onNotify(`EcoCash payment of M${formData.amount} initiated - waiting for PIN`, 'info');
    } catch (error) {
      setTransactionResult({
        success: false,
        message: error.message
      });
      onNotify(`Payment initiation failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!pendingTransaction) return;
    
    setLoading(true);
    try {
      const result = await sandboxService.completeEcoCashPayment(
        pendingTransaction.transactionId,
        formData.pin
      );
      
      setTransactionResult({
        success: result.status === 'SUCCESS',
        data: result,
        message: result.message
      });
      
      onNotify(`Payment ${result.status}: ${result.message}`, result.status === 'SUCCESS' ? 'success' : 'error');
      setPendingTransaction(null);
    } catch (error) {
      setTransactionResult({
        success: false,
        message: error.message
      });
      onNotify(`Payment completion failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayment = () => {
    setPendingTransaction(null);
    onNotify('Payment cancelled', 'warning');
  };

  const selectTestAccount = (phone) => {
    setFormData({ ...formData, phone });
  };

  return (
    <div className="simulator-container">
      <div className="simulator-section">
        <h2>💰 EcoCash Lesotho Simulator</h2>
        <p className="simulator-desc">Simulate merchant payments with PIN confirmation</p>
        
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
                <div className="account-badge">{account.verified ? '✓ Verified' : '⚠️ Unverified'}</div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleInitiatePayment} className="payment-form">
          <h3>💸 Initiate Payment</h3>
          
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
            <small>EcoCash registered number</small>
          </div>

          <div className="form-group">
            <label>Amount (M):</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              min="1"
              max="30000"
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
            {loading ? 'Processing...' : '💸 Initiate Payment'}
          </button>
        </form>

        {pendingTransaction && (
          <div className="pin-confirmation">
            <h3>🔐 PIN Confirmation Required</h3>
            <p>Amount: <strong>M{pendingTransaction.amount}</strong></p>
            <p>To: <strong>{pendingTransaction.phone}</strong></p>
            <div className="pin-input-group">
              <input
                type="password"
                name="pin"
                value={formData.pin}
                onChange={handleInputChange}
                placeholder="Enter 4-digit PIN"
                maxLength="4"
                pattern="[0-9]{4}"
              />
              <button onClick={handleCompletePayment} className="btn-success">
                Confirm Payment
              </button>
              <button onClick={handleCancelPayment} className="btn-danger">
                Cancel
              </button>
            </div>
            <small>Test PIN: 1234 for all test accounts</small>
          </div>
        )}

        {transactionResult && !pendingTransaction && (
          <div className={`transaction-result ${transactionResult.success ? 'success' : 'error'}`}>
            <h4>{transactionResult.success ? '✅ Payment Processed' : '❌ Payment Failed'}</h4>
            <p>{transactionResult.message}</p>
            {transactionResult.data && (
              <pre>{JSON.stringify(transactionResult.data, null, 2)}</pre>
            )}
          </div>
        )}
      </div>

      <div className="simulator-sidebar">
        <div className="info-card">
          <h3>📊 EcoCash Stats</h3>
          <div className="stat-row">
            <span>Total Transactions:</span>
            <strong>{stats?.totalTransactions || 0}</strong>
          </div>
          <div className="stat-row">
            <span>Successful:</span>
            <strong className="text-success">{stats?.success || 0}</strong>
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
            <span>Active Sessions:</span>
            <strong>{stats?.activeSessions || 0}</strong>
          </div>
        </div>

        <div className="info-card">
          <h3>📖 EcoCash Flow</h3>
          <ol>
            <li>Initiate payment with amount and phone</li>
            <li>System prompts for PIN confirmation</li>
            <li>Enter PIN (1234 for tests)</li>
            <li>Payment processes with configured delay</li>
            <li>Webhook sent to callback URL</li>
          </ol>
          <div className="info-note">
            💡 Tip: Test PIN is always 1234 in sandbox
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcoCashSimulator;