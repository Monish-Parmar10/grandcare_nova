import React from 'react';

const LargeButton = ({ children, onClick, type = 'button', variant = 'primary', icon: Icon, className = '', disabled = false }) => {
  const baseClasses = variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : 'btn-secondary';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} w-full gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {Icon && <Icon className="w-7 h-7" />}
      {children}
    </button>
  );
};

export default LargeButton;
