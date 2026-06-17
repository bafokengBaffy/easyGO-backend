// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import Button from '@/components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-blue-600 mb-2 animate-bounce">404</div>
          <div className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</div>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Illustration */}
        <div className="mb-8">
          <svg
            className="w-48 h-48 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link to="/">
            <Button icon={Home} fullWidth>
              Back to Home
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full inline-flex items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-400 mt-8">
          Need help? <Link to="/support" className="text-blue-600 hover:underline">Contact Support</Link>
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;