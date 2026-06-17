// src/pages/driver/Earnings.jsx
import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp, Download, Wallet, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { driverService } from '@/services/driver.service';
import { paymentService } from '@/services/payment.service';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

const Earnings = () => {
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    pending: 0,
    paid: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [withdrawalMethods, setWithdrawalMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    fetchEarnings();
    fetchTransactions();
    fetchPayoutHistory();
    fetchWithdrawalMethods();
  }, [period]);

  const fetchEarnings = async () => {
    try {
      const data = await driverService.getEarnings(period);
      setEarnings(data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
      toast.error('Failed to load earnings data');
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await driverService.getRideTransactions(period);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchPayoutHistory = async () => {
    try {
      const data = await paymentService.getPayoutHistory();
      setPayoutHistory(data);
    } catch (error) {
      console.error('Failed to fetch payout history:', error);
    }
  };

  const fetchWithdrawalMethods = async () => {
    try {
      const methods = await paymentService.getWithdrawalMethods();
      setWithdrawalMethods(methods);
    } catch (error) {
      console.error('Failed to fetch withdrawal methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawAmount) > earnings.pending) {
      toast.error('Insufficient balance');
      return;
    }

    if (!selectedMethod) {
      toast.error('Please select a withdrawal method');
      return;
    }

    try {
      await paymentService.requestWithdrawal({
        amount: parseFloat(withdrawAmount),
        methodId: selectedMethod
      });
      toast.success('Withdrawal request submitted successfully');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      fetchEarnings();
      fetchPayoutHistory();
    } catch (error) {
      toast.error(error.message || 'Failed to process withdrawal');
    }
  };

  const handleExportStatement = async () => {
    try {
      await driverService.exportEarningsStatement(period);
      toast.success('Statement downloaded successfully');
    } catch (error) {
      toast.error('Failed to download statement');
    }
  };

  const EarningsCard = ({ title, amount, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-500 text-sm">{title}</p>
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
      {trend && (
        <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last {period}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
            <p className="text-gray-600 mt-2">Track your earnings and manage payouts</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleExportStatement} icon={Download} variant="outline">
              Export Statement
            </Button>
            <Button onClick={() => setShowWithdrawModal(true)} icon={Wallet}>
              Withdraw
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow mb-6 p-2 inline-flex">
          {['day', 'week', 'month', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg capitalize ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p === 'all' ? 'All Time' : p}
            </button>
          ))}
        </div>

        {/* Earnings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <EarningsCard 
            title="Today's Earnings" 
            amount={earnings.today} 
            icon={DollarSign} 
            color="bg-green-500"
          />
          <EarningsCard 
            title="This Week" 
            amount={earnings.week} 
            icon={TrendingUp} 
            color="bg-blue-500"
            trend={12}
          />
          <EarningsCard 
            title="This Month" 
            amount={earnings.month} 
            icon={Calendar} 
            color="bg-purple-500"
            trend={8}
          />
          <EarningsCard 
            title="Pending Payout" 
            amount={earnings.pending} 
            icon={Clock} 
            color="bg-yellow-500"
          />
          <EarningsCard 
            title="Total Earnings" 
            amount={earnings.total} 
            icon={DollarSign} 
            color="bg-indigo-500"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Transaction History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Recent Transactions</h2>
              </div>
              <div className="divide-y">
                {transactions.length > 0 ? (
                  transactions.map(transaction => (
                    <div key={transaction.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Car className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">Ride #{transaction.rideId}</p>
                            <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                            <p className="text-xs text-gray-400">{transaction.pickup} → {transaction.destination}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            +{formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payout Summary */}
          <div className="space-y-6">
            {/* Payout History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Payout History</h2>
              <div className="space-y-4">
                {payoutHistory.length > 0 ? (
                  payoutHistory.map(payout => (
                    <div key={payout.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{formatCurrency(payout.amount)}</p>
                        <p className="text-sm text-gray-500">{formatDate(payout.date)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          payout.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : payout.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payout.status}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{payout.method}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No payout history</p>
                )}
              </div>
            </div>

            {/* Withdrawal Methods */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Withdrawal Methods</h2>
                <Button size="sm" onClick={() => setShowAddMethodModal(true)}>
                  + Add
                </Button>
              </div>
              <div className="space-y-3">
                {withdrawalMethods.length > 0 ? (
                  withdrawalMethods.map(method => (
                    <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Wallet className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{method.type}</p>
                          <p className="text-sm text-gray-500">{method.details}</p>
                        </div>
                      </div>
                      {method.isDefault && (
                        <span className="text-xs text-green-600">Default</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No withdrawal methods added
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Withdraw Earnings"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(earnings.pending)}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Amount
            </label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Method
            </label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a method</option>
              {withdrawalMethods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.type} - {method.details}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowWithdrawModal(false)} fullWidth>
              Cancel
            </Button>
            <Button onClick={handleWithdraw} fullWidth>
              Confirm Withdrawal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Withdrawal Method Modal */}
      <Modal
        isOpen={showAddMethodModal}
        onClose={() => setShowAddMethodModal(false)}
        title="Add Withdrawal Method"
        size="md"
      >
        <AddWithdrawalMethodForm
          onSuccess={() => {
            setShowAddMethodModal(false);
            fetchWithdrawalMethods();
          }}
          onCancel={() => setShowAddMethodModal(false)}
        />
      </Modal>
    </div>
  );
};

const AddWithdrawalMethodForm = ({ onSuccess, onCancel }) => {
  const [methodType, setMethodType] = useState('bank');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const methodData = {
        type: methodType,
        accountName,
        accountNumber,
        bankName,
        routingNumber
      };
      
      await paymentService.addWithdrawalMethod(methodData);
      toast.success('Withdrawal method added successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to add withdrawal method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Method Type
        </label>
        <select
          value={methodType}
          onChange={(e) => setMethodType(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="bank">Bank Account</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>

      <input
        type="text"
        placeholder="Account Holder Name"
        value={accountName}
        onChange={(e) => setAccountName(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <input
        type="text"
        placeholder="Account Number"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      {methodType === 'bank' && (
        <>
          <input
            type="text"
            placeholder="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Routing Number"
            value={routingNumber}
            onChange={(e) => setRoutingNumber(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button type="submit" loading={loading} fullWidth>
          Add Method
        </Button>
      </div>
    </form>
  );
};

export default Earnings;