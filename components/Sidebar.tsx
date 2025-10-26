import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import type { View } from '../types';
import {
  DashboardIcon,
  ProductsIcon,
  PosIcon,
  ReportsIcon,
  SettingsIcon,
} from './icons/Icons';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: t('sidebar.dashboard'), icon: <DashboardIcon className="w-6 h-6 flex-shrink-0" /> },
    { view: 'products', label: t('sidebar.products'), icon: <ProductsIcon className="w-6 h-6 flex-shrink-0" /> },
    { view: 'pos', label: t('sidebar.pos'), icon: <PosIcon className="w-6 h-6 flex-shrink-0" /> },
    { view: 'reports', label: t('sidebar.reports'), icon: <ReportsIcon className="w-6 h-6 flex-shrink-0" /> },
    { view: 'settings', label: t('sidebar.settings'), icon: <SettingsIcon className="w-6 h-6 flex-shrink-0" /> },
  ];

  return (
    <aside 
      className={`bg-slate-900 flex flex-col shadow-lg transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="p-6 border-b border-slate-700 flex items-center space-x-3 overflow-hidden">
        {currentUser?.shopLogo ? (
            <img src={currentUser.shopLogo} alt="Shop Logo" className="h-10 w-10 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-600" />
        ) : (
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 ring-2 ring-slate-600">
                {currentUser?.shopName?.charAt(0).toUpperCase()}
            </div>
        )}
        <div className={`transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            <h1 className="text-lg font-bold text-white truncate whitespace-nowrap">{currentUser?.shopName}</h1>
            <p className="text-xs text-slate-400 truncate whitespace-nowrap">{currentUser?.name}</p>
        </div>
      </div>

      <nav className={`flex-1 py-6 space-y-2 ${isExpanded ? 'px-4' : 'px-2'}`}>
        {navItems.map(item => (
          <button
            key={item.view}
            onClick={() => setCurrentView(item.view)}
            className={`w-full flex items-center py-2.5 rounded-lg transition-colors text-sm font-medium ${
              isExpanded ? 'px-4' : 'px-3 justify-center'
            } ${
              currentView === item.view
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
            aria-current={currentView === item.view ? 'page' : undefined}
          >
            {item.icon}
            {isExpanded && <span className="ml-4 whitespace-nowrap">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        {/* Footer or version number can go here */}
      </div>
    </aside>
  );
};

export default Sidebar;