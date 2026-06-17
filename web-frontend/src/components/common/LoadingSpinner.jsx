// src/components/common/LoadingSpinner.jsx
import React from 'react';

export const LoadingSpinner = ({ size = 'md', color = 'blue', fullScreen = false, text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  const colors = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600'
  };
  
  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`
          ${sizes[size]} ${colors[color]}
          animate-spin rounded-full border-4 border-t-transparent
          border-current
        `}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && <p className="mt-3 text-sm text-gray-500">{text}</p>}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }
  
  return spinner;
};

export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const skeletons = {
    card: (
      <div className="bg-white rounded-lg shadow p-4 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    ),
    list: (
      <div className="animate-pulse space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mt-1"></div>
          </div>
        </div>
      </div>
    ),
    table: (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded w-full mt-2"></div>
        ))}
      </div>
    )
  };
  
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i}>{skeletons[type] || skeletons.card}</div>
      ))}
    </>
  );
};