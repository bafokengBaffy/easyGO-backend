// src/pages/admin/Analytics.jsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Users, Car, DollarSign, Calendar, Download,
  BarChart3, LineChart, PieChart, Activity, ArrowUp, ArrowDown
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import Button from '@/components/common/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    revenue: [],
    rides: [],
    users: [],
    drivers: []
  });
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalRides: 0,
    totalUsers: 0,
    totalDrivers: 0,
    avgRating: 0,
    completionRate: 0,
    revenueGrowth: 0,
    ridesGrowth: 0
  });
  const [demographics, setDemographics] = useState({
    ageGroups: [],
    topLocations: [],
    vehiclePreference: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [metricsData, summaryData, demographicsData] = await Promise.all([
        adminService.getAnalytics('all', period),
        adminService.getDashboardStats(),
        adminService.getDemographics()
      ]);
      
      setMetrics(metricsData);
      setSummary(summaryData);
      setDemographics(demographicsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await adminService.exportAnalytics(period);
      toast.success('Analytics exported successfully');
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const SummaryCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span className="text-sm font-medium ml-1">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-gray-500 text-sm mt-1">{title}</p>
      {trendValue && <p className="text-xs text-gray-400 mt-2">vs last {period}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor platform performance and trends</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white rounded-lg shadow">
            {['day', 'week', 'month', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 capitalize ${
                  period === p
                    ? 'bg-blue-600 text-white rounded-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <Button onClick={handleExport} icon={Download} variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={DollarSign}
          trend={summary.revenueGrowth}
          color="bg-green-500"
        />
        <SummaryCard
          title="Total Rides"
          value={summary.totalRides.toLocaleString()}
          icon={Car}
          trend={summary.ridesGrowth}
          color="bg-blue-500"
        />
        <SummaryCard
          title="Active Users"
          value={summary.totalUsers.toLocaleString()}
          icon={Users}
          trend={12.5}
          color="bg-purple-500"
        />
        <SummaryCard
          title="Active Drivers"
          value={summary.totalDrivers.toLocaleString()}
          icon={Car}
          trend={8.3}
          color="bg-yellow-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ReLineChart data={metrics.revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Expenses" />
            </ReLineChart>
          </ResponsiveContainer>
        </div>

        {/* Rides Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Rides Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ReBarChart data={metrics.rides}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10B981" name="Completed" />
              <Bar dataKey="cancelled" fill="#EF4444" name="Cancelled" />
            </ReBarChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ReLineChart data={metrics.users}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="riders" stroke="#8B5CF6" name="Riders" />
              <Line type="monotone" dataKey="drivers" stroke="#F59E0B" name="Drivers" />
            </ReLineChart>
          </ResponsiveContainer>
        </div>

        {/* Demographics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Vehicle Preference</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={demographics.vehiclePreference}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {demographics.vehiclePreference.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Locations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top Pickup Locations</h2>
          <div className="space-y-3">
            {demographics.topLocations.map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-gray-500 w-8">{index + 1}.</span>
                  <span className="font-medium">{location.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-4">{location.count.toLocaleString()} rides</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 rounded-full h-2"
                      style={{ width: `${location.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{summary.completionRate}%</p>
              <p className="text-sm text-gray-600 mt-1">Completion Rate</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{summary.avgRating}</p>
              <p className="text-sm text-gray-600 mt-1">Average Rating</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {((summary.totalRides / summary.totalUsers) || 0).toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Rides per User</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {((summary.totalRevenue / summary.totalRides) || 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Avg Ride Value</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;