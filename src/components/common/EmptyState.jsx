import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action, className = '' }) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="mx-auto w-24 h-24 text-gray-300 mb-4">
          <Icon size={96} />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && action}
    </div>
  );
};

export default EmptyState;