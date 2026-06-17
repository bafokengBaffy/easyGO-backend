// src/pages/driver/Vehicle.jsx
import React, { useState, useEffect } from 'react';
import { Car, Image, FileText, AlertCircle, CheckCircle, Upload, Trash2 } from 'lucide-react';
import { driverService } from '@/services/driver.service';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';

const Vehicle = () => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    model: '',
    make: '',
    year: '',
    licensePlate: '',
    color: '',
    seats: 4,
    vehicleType: 'standard',
    features: []
  });

  const vehicleTypes = [
    { id: 'economy', name: 'Economy', multiplier: 1.0 },
    { id: 'standard', name: 'Standard', multiplier: 1.3 },
    { id: 'premium', name: 'Premium', multiplier: 1.8 },
    { id: 'suv', name: 'SUV', multiplier: 2.0 }
  ];

  const features = [
    'Air Conditioning', 'GPS Navigation', 'Music System', 'USB Charging',
    'Child Seat', 'Wheelchair Accessible', 'Pet Friendly', 'Luggage Space'
  ];

  useEffect(() => {
    fetchVehicle();
  }, []);

  const fetchVehicle = async () => {
    setLoading(true);
    try {
      const data = await driverService.getVehicle();
      setVehicle(data);
      setFormData(data);
    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await driverService.updateVehicle(formData);
      setVehicle(formData);
      setEditing(false);
      toast.success('Vehicle information updated successfully');
    } catch (error) {
      toast.error('Failed to update vehicle information');
    }
  };

  const handleDocumentUpload = async (type, file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append(type, file);
      await driverService.uploadDocuments(formData);
      toast.success(`${type} uploaded successfully`);
      fetchVehicle();
    } catch (error) {
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(false);
    }
  };

  const DocumentCard = ({ title, type, document, onUpload }) => (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <h3 className="font-medium">{title}</h3>
            {document ? (
              <div className="mt-2">
                <p className="text-sm text-green-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Uploaded on {new Date(document.uploadedAt).toLocaleDateString()}
                </p>
                {document.verified && (
                  <p className="text-xs text-green-600 mt-1">✓ Verified</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-red-600 mt-1">Not uploaded</p>
            )}
          </div>
        </div>
        <label className="cursor-pointer">
          <Button size="sm" variant="outline" icon={Upload}>
            Upload
          </Button>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.png"
            onChange={(e) => onUpload(type, e.target.files[0])}
          />
        </label>
      </div>
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
    <div className="min-h-screen bg-gray-100">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Vehicle</h1>
            <p className="text-gray-600 mt-2">Manage your vehicle information and documents</p>
          </div>
          {!editing && (
            <Button onClick={() => setEditing(true)}>
              Edit Vehicle Info
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Vehicle Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Car className="w-5 h-5 mr-2 text-blue-600" />
              Vehicle Information
            </h2>
            
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Make"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    placeholder="e.g., Toyota"
                  />
                  <Input
                    label="Model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g., Camry"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2020"
                  />
                  <Input
                    label="Color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g., White"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="License Plate"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    placeholder="ABC 123"
                  />
                  <Input
                    label="Number of Seats"
                    type="number"
                    min="2"
                    max="7"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {vehicleTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.multiplier}x multiplier)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {features.map(feature => (
                      <label key={feature} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.features?.includes(feature)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                features: [...(formData.features || []), feature]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                features: formData.features.filter(f => f !== feature)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setEditing(false)} fullWidth>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} fullWidth>
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Make & Model</p>
                    <p className="font-medium">{vehicle?.make} {vehicle?.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-medium">{vehicle?.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Color</p>
                    <p className="font-medium">{vehicle?.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">License Plate</p>
                    <p className="font-medium">{vehicle?.licensePlate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Seats</p>
                    <p className="font-medium">{vehicle?.seats}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Type</p>
                    <p className="font-medium capitalize">{vehicle?.vehicleType}</p>
                  </div>
                </div>
                
                {vehicle?.features?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Features</p>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.features.map(feature => (
                        <span key={feature} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Vehicle Documents
            </h2>
            
            <div className="space-y-4">
              <DocumentCard
                title="Vehicle Registration"
                type="vehicleRegistration"
                document={vehicle?.documents?.vehicleRegistration}
                onUpload={handleDocumentUpload}
              />
              
              <DocumentCard
                title="Insurance Certificate"
                type="insurance"
                document={vehicle?.documents?.insurance}
                onUpload={handleDocumentUpload}
              />
              
              <DocumentCard
                title="Inspection Certificate"
                type="inspection"
                document={vehicle?.documents?.inspection}
                onUpload={handleDocumentUpload}
              />
              
              <DocumentCard
                title="Vehicle Photos"
                type="vehiclePhotos"
                document={vehicle?.documents?.vehiclePhotos}
                onUpload={handleDocumentUpload}
              />
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Document Requirements</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    All documents must be clear and valid. Accepted formats: PDF, JPG, PNG (max 5MB).
                    Documents will be verified within 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Status */}
        {vehicle?.status === 'pending' && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
              <div>
                <p className="font-medium text-yellow-800">Vehicle Verification Pending</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Your vehicle is currently under review. You'll be notified once verified.
                  This usually takes 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {vehicle?.status === 'approved' && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
              <div>
                <p className="font-medium text-green-800">Vehicle Verified</p>
                <p className="text-sm text-green-700 mt-1">
                  Your vehicle has been verified and is ready for ride requests.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicle;