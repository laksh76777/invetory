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
  AiIcon,
  LogoutIcon
} from './icons/Icons';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const { currentUser, logout } = useAuth();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: t('sidebar.dashboard'), icon: <DashboardIcon className="w-6 h-6" /> },
    { view: 'products', label: t('sidebar.products'), icon: <ProductsIcon className="w-6 h-6" /> },
    { view: 'pos', label: t('sidebar.pos'), icon: <PosIcon className="w-6 h-6" /> },
    { view: 'reports', label: t('sidebar.reports'), icon: <ReportsIcon className="w-6 h-6" /> },
    { view: 'ai_chatbot', label: t('sidebar.ai_chatbot'), icon: <AiIcon className="w-6 h-6" /> },
    { view: 'settings', label: t('sidebar.settings'), icon: <SettingsIcon className="w-6 h-6" /> },
  ];

  return (
    <aside 
      className={`bg-white dark:bg-slate-900 flex flex-col border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out z-20 ${isExpanded ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`border-b border-slate-200 dark:border-slate-800 flex items-center h-20 px-4 transition-all duration-300 ${isExpanded ? 'justify-start' : 'justify-center'}`}>
        <div className="flex-shrink-0">
            {currentUser?.shopLogo ? (
                <img src={currentUser.shopLogo} alt="Shop Logo" className="h-12 w-12 rounded-full object-cover ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-primary-500" />
            ) : (
                <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-xl ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-primary-500">
                    {currentUser?.shopName?.charAt(0).toUpperCase()}
                </div>
            )}
        </div>
        <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'w-40 ml-4 opacity-100' : 'w-0 ml-0 opacity-0'}`}>
            <h1 className="text-md font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser?.shopName}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.name}</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(item => (
          <button
            key={item.view}
            onClick={() => setCurrentView(item.view)}
            className={`w-full flex items-center py-2.5 px-4 rounded-lg transition-all duration-200 text-sm font-medium group ${
              currentView === item.view
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            aria-current={currentView === item.view ? 'page' : undefined}
          >
            <span className={currentView === item.view ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition'}>
                {item.icon}
            </span>
            <span className={`ml-4 whitespace-nowrap transition-opacity ${isExpanded ? 'opacity-100 delay-150 duration-200' : 'opacity-0 pointer-events-none'}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-2 border-t border-slate-200 dark:border-slate-800">
        <button
            onClick={logout}
            className="w-full flex items-center py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 group"
        >
            <span className="text-slate-400 dark:text-slate-500 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition">
                <LogoutIcon className="w-6 h-6" />
            </span>
            <span className={`ml-4 whitespace-nowrap transition-opacity ${isExpanded ? 'opacity-100 delay-150 duration-200' : 'opacity-0 pointer-events-none'}`}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
