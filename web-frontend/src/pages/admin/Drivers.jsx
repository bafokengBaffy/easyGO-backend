// src/pages/admin/Drivers.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MoreVertical, UserPlus, Edit2, Trash2, 
  CheckCircle, XCircle, Shield, Car, Phone, Mail, MapPin,
  Download, Upload, Eye, Ban, Check, AlertTriangle
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    online: 0
  });

  useEffect(() => {
    fetchDrivers();
    fetchStats();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDrivers();
      setDrivers(data);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminService.getDriverStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleVerifyDriver = async (driverId) => {
    try {
      await adminService.verifyDriver(driverId);
      toast.success('Driver verified successfully');
      fetchDrivers();
      setShowVerifyModal(false);
    } catch (error) {
      toast.error('Failed to verify driver');
    }
  };

  const handleSuspendDriver = async (driverId) => {
    if (!suspendReason) {
      toast.error('Please provide a reason for suspension');
      return;
    }
    
    try {
      await adminService.suspendDriver(driverId, suspendReason);
      toast.success('Driver suspended successfully');
      fetchDrivers();
      setShowSuspendModal(false);
      setSuspendReason('');
    } catch (error) {
      toast.error('Failed to suspend driver');
    }
  };

  const handleActivateDriver = async (driverId) => {
    try {
      await adminService.activateDriver(driverId);
      toast.success('Driver activated successfully');
      fetchDrivers();
    } catch (error) {
      toast.error('Failed to activate driver');
    }
  };

  const handleExportDrivers = async () => {
    try {
      await adminService.exportDrivers();
      toast.success('Drivers exported successfully');
    } catch (error) {
      toast.error('Failed to export drivers');
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || driver.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      offline: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
        <p className="text-gray-600 mt-2">Manage all drivers, verify documents, and monitor performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Drivers" value={stats.total} icon={Car} color="bg-blue-500" />
        <StatCard title="Active Drivers" value={stats.active} icon={CheckCircle} color="bg-green-500" />
        <StatCard title="Pending Verification" value={stats.pending} icon={Shield} color="bg-yellow-500" />
        <StatCard title="Suspended" value={stats.suspended} icon={Ban} color="bg-red-500" />
        <StatCard title="Currently Online" value={stats.online} icon={Car} color="bg-purple-500" />
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending Verification</option>
            <option value="suspended">Suspended</option>
          </select>
          <Button onClick={handleExportDrivers} icon={Download} variant="outline">
            Export
          </Button>
          <Button icon={UserPlus}>
            Add Driver
          </Button>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rides</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{driver.name.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                          <div className="text-sm text-gray-500">{driver.email}</div>
                          <div className="text-xs text-gray-400">{driver.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{driver.vehicle?.model || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{driver.vehicle?.licensePlate || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(driver.status)}`}>
                        {driver.status}
                      </span>
                      {driver.isOnline && (
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Online
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.totalRides || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500">{driver.rating || 'N/A'}</span>
                        {driver.rating > 0 && <span className="text-yellow-400 ml-1">★</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(driver.totalEarnings || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(driver.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedDriver(driver);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {driver.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedDriver(driver);
                            setShowVerifyModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="Verify"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {driver.status === 'active' && (
                        <button
                          onClick={() => {
                            setSelectedDriver(driver);
                            setShowSuspendModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Suspend"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      {driver.status === 'suspended' && (
                        <button
                          onClick={() => handleActivateDriver(driver.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Activate"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Driver Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Driver Details"
        size="lg"
      >
        {selectedDriver && (
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{selectedDriver.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedDriver.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedDriver.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{formatDate(selectedDriver.dob)}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Vehicle Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Vehicle Model</p>
                  <p className="font-medium">{selectedDriver.vehicle?.model || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">License Plate</p>
                  <p className="font-medium">{selectedDriver.vehicle?.licensePlate || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vehicle Color</p>
                  <p className="font-medium">{selectedDriver.vehicle?.color || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year</p>
                  <p className="font-medium">{selectedDriver.vehicle?.year || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Documents</h3>
              <div className="space-y-2">
                {selectedDriver.documents?.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{doc.type}</p>
                      <p className="text-sm text-gray-500">Uploaded: {formatDate(doc.uploadedAt)}</p>
                    </div>
                    <div className="flex items-center">
                      {doc.verified ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                      )}
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Performance Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedDriver.totalRides || 0}</p>
                  <p className="text-sm text-gray-600">Total Rides</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{selectedDriver.completionRate || 0}%</p>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{selectedDriver.rating || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Verify Driver Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Verify Driver"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to verify <strong>{selectedDriver?.name}</strong> as a driver?
            This will allow them to start accepting rides.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowVerifyModal(false)} fullWidth>
              Cancel
            </Button>
            <Button onClick={() => handleVerifyDriver(selectedDriver?.id)} fullWidth>
              Verify Driver
            </Button>
          </div>
        </div>
      </Modal>

      {/* Suspend Driver Modal */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title="Suspend Driver"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to suspend <strong>{selectedDriver?.name}</strong>?
          </p>
          <textarea
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder="Reason for suspension"
            rows="3"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowSuspendModal(false)} fullWidth>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => handleSuspendDriver(selectedDriver?.id)} fullWidth>
              Suspend Driver
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Drivers;