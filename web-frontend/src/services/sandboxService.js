/**
 * Sandbox Service - API calls to backend sandbox endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class SandboxService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/sandbox`;
  }

  async getStatus() {
    const response = await fetch(`${this.baseURL}/status`);
    if (!response.ok) throw new Error('Failed to fetch sandbox status');
    return response.json();
  }

  async configureSimulation(provider, delay, failureRate) {
    const response = await fetch(`${this.baseURL}/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, delay, failureRate })
    });
    if (!response.ok) throw new Error('Failed to configure simulation');
    return response.json();
  }

  async resetSimulation(provider) {
    const response = await fetch(`${this.baseURL}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider })
    });
    if (!response.ok) throw new Error('Failed to reset simulation');
    return response.json();
  }

  async getTestAccounts() {
    const response = await fetch(`${this.baseURL}/test-accounts`);
    if (!response.ok) throw new Error('Failed to fetch test accounts');
    return response.json();
  }

  async generateTestData(type, count = 10) {
    const response = await fetch(`${this.baseURL}/generate-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, count })
    });
    if (!response.ok) throw new Error('Failed to generate test data');
    return response.json();
  }

  async runScenario(scenario, provider, count = 5) {
    const response = await fetch(`${this.baseURL}/run-scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, provider, count })
    });
    if (!response.ok) throw new Error('Failed to run scenario');
    return response.json();
  }

  async getTransactions(provider = null, status = null, limit = 50, offset = 0) {
    let url = `${this.baseURL}/transactions?limit=${limit}&offset=${offset}`;
    if (provider) url += `&provider=${provider}`;
    if (status) url += `&status=${status}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  }

  async testMpesaPayment(amount, phone, reference) {
    const response = await fetch(`${this.baseURL}/test/mpesa-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, phone, reference })
    });
    if (!response.ok) throw new Error('M-Pesa test payment failed');
    return response.json();
  }

  async testEcoCashPayment(amount, phone, reference) {
    const response = await fetch(`${this.baseURL}/test/ecocash-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, phone, reference })
    });
    if (!response.ok) throw new Error('EcoCash test payment failed');
    return response.json();
  }

  async completeEcoCashPayment(transactionId, pin = '1234') {
    const response = await fetch(`${this.baseURL}/test/ecocash-complete/${transactionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    if (!response.ok) throw new Error('Failed to complete EcoCash payment');
    return response.json();
  }

  async simulateWebhook(transactionId, provider, event) {
    const response = await fetch(`${this.baseURL}/simulate-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, provider, event })
    });
    if (!response.ok) throw new Error('Failed to simulate webhook');
    return response.json();
  }
}

export default new SandboxService();