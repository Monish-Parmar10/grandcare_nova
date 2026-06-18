import React from 'react';

const Card = ({ children, className = '', onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
