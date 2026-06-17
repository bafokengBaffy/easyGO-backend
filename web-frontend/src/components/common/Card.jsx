import React from 'react';

const Card = ({ children, title, className = '', padding = true }) => {
  return (
    <div className={`bg-white rounded-lg shadow ${padding ? 'p-6' : ''} ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
