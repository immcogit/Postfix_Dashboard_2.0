import React from 'react';
import { HomeIcon, DocumentTextIcon, SparklesIcon, GlobeAltIcon, MailIcon } from './icons/IconComponents';

type View = 'dashboard' | 'logs' | 'analysis' | 'networks';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <li
      onClick={onClick}
      className={`flex items-center p-3 my-1 rounded-md cursor-pointer transition-colors duration-200 ${
        isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-3 font-medium">{label}</span>
    </li>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="w-64 bg-gray-800 p-4 flex flex-col border-r border-gray-700">
        <div className="flex items-center mb-8 px-2">
            <MailIcon className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold text-gray-100 ml-2">Postfix</h2>
        </div>
      <nav>
        <ul>
          <NavItem
            icon={<HomeIcon className="w-6 h-6" />}
            label="Dashboard"
            isActive={activeView === 'dashboard'}
            onClick={() => setActiveView('dashboard')}
          />
          <NavItem
            icon={<DocumentTextIcon className="w-6 h-6" />}
            label="Mail Logs"
            isActive={activeView === 'logs'}
            onClick={() => setActiveView('logs')}
          />
          <NavItem
            icon={<SparklesIcon className="w-6 h-6" />}
            label="AI Log Analysis"
            isActive={activeView === 'analysis'}
            onClick={() => setActiveView('analysis')}
          />
          <NavItem
            icon={<GlobeAltIcon className="w-6 h-6" />}
            label="Allowed Networks"
            isActive={activeView === 'networks'}
            onClick={() => setActiveView('networks')}
          />
        </ul>
      </nav>
      <div className="mt-auto text-center text-gray-500 text-xs">
        <p>Postfix Monitoring Dashboard v2.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;