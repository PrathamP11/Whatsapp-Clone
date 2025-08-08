import React from 'react';

const LoadingSpinner = ({ size = '24px' }) => {
  return (
    <div 
      className="loading-spinner" 
      style={{ width: size, height: size }}
      aria-label="Loading..."
    />
  );
};

export default LoadingSpinner;