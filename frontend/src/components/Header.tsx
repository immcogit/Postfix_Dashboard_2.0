import React from 'react';
import { ArrowLeftOnRectangleIcon } from './icons/IconComponents';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-100">Monitoring Dashboard</h1>
      <div className="flex items-center space-x-4">
        <span className="text-gray-400">Welcome, Admin</span>
        <button
          onClick={onLogout}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors duration-200"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;