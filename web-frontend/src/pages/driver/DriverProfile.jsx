import React, { useState } from 'react';
import { uploadImage } from '../../services/cloudinary.service';
import { db, auth } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import './DriverDashboard.css';

const DriverProfile = () => {
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState({ license: null, identity: null });
  const [status, setStatus] = useState('');

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setStatus(`Uploading ${type}...`);
      
      const url = await uploadImage(file);
      
      // Update state
      setDocs(prev => ({ ...prev, [type]: url }));

      // Sync to Firestore automatically (Production Ready)
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        [`documents.${type}`]: url,
        verificationStatus: 'PENDING'
      });

      setStatus(`${type} uploaded successfully!`);
    } catch (error) {
      setStatus('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Verification Center</h1>
          <p>Upload your professional documents to start driving</p>
        </div>
      </div>

      <div className="data-table" style={{ padding: '30px', maxWidth: '800px' }}>
        <div className="doc-upload-grid" style={{ display: 'grid', gap: '20px' }}>
          <div className="upload-box" style={{ border: '2px dashed #ddd', padding: '20px', borderRadius: '12px' }}>
            <h3>Drivers License (Front)</h3>
            {docs.license ? (
              <img src={docs.license} alt="License" style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }} />
            ) : (
              <input type="file" onChange={(e) => handleFileUpload(e, 'license')} disabled={uploading} />
            )}
          </div>

          <div className="upload-box" style={{ border: '2px dashed #ddd', padding: '20px', borderRadius: '12px' }}>
            <h3>National Identity Document</h3>
            {docs.identity ? (
              <img src={docs.identity} alt="ID" style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }} />
            ) : (
              <input type="file" onChange={(e) => handleFileUpload(e, 'identity')} disabled={uploading} />
            )}
          </div>
        </div>

        {status && <p style={{ marginTop: '20px', color: '#854d0e', fontWeight: 'bold' }}>{status}</p>}
        
        {uploading && (
          <div className="loading-overlay" style={{ marginTop: '10px' }}>
            <span className="pulse-indicator">Processing Secure Upload...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverProfile;