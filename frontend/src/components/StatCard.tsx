// ============================================
// FILE: frontend/src/components/StatCard.tsx
// ============================================
// Path: postfix-dashboard/frontend/src/components/StatCard.tsx
// Action: REPLACE your existing StatCard.tsx

import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  status?: 'success' | 'danger' | 'warning';
  onClick?: () => void;
  isClickable?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  change, 
  status,
  onClick,
  isClickable = false 
}) => {
  const statusClasses = {
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
    default: 'text-gray-400'
  };

  const changeColor = status ? statusClasses[status] : statusClasses.default;

  const handleClick = () => {
    if (isClickable && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      className={`bg-gray-800 p-6 rounded-lg border border-gray-700 flex items-center justify-between transition-all ${
        isClickable 
          ? 'cursor-pointer hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-100' 
          : ''
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `View ${title} logs` : undefined}
    >
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-100 mt-1">{value}</p>
        <div className={`flex items-center text-sm mt-2 font-medium ${changeColor}`}>
          <span>{change}</span>
        </div>
      </div>
      <div className="bg-gray-700/50 p-4 rounded-full">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;