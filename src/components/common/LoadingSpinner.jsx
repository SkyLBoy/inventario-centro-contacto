import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Cargando...', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizes[size]} mb-4`}></div>
      {text && <p className="text-gray-600 animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;