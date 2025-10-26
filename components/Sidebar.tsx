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
  LogoutIcon,
} from './icons/Icons';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isMobileOpen, setIsMobileOpen }) => {
  const { currentUser, logout } = useAuth();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: t('sidebar.dashboard'), icon: <DashboardIcon /> },
    { view: 'products', label: t('sidebar.products'), icon: <ProductsIcon /> },
    { view: 'pos', label: t('sidebar.pos'), icon: <PosIcon /> },
    { view: 'reports', label: t('sidebar.reports'), icon: <ReportsIcon /> },
    { view: 'settings', label: t('sidebar.settings'), icon: <SettingsIcon /> },
  ];

  const handleItemClick = (view: View) => {
    setCurrentView(view);
    setIsMobileOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileOpen && (
          <div
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
              aria-hidden="true"
          ></div>
      )}
      <aside 
        className={`fixed inset-y-0 left-0 bg-slate-900 flex flex-col shadow-lg z-40
                    transform transition-transform duration-300 ease-in-out
                    lg:relative lg:translate-x-0 lg:transition-all lg:duration-300
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${isExpanded ? 'lg:w-64' : 'lg:w-20'}`}
        onMouseEnter={() => { if (window.innerWidth >= 1024) setIsExpanded(true); }}
        onMouseLeave={() => { if (window.innerWidth >= 1024) setIsExpanded(false); }}
      >
        <div className="p-6 border-b border-slate-700 flex items-center space-x-3 overflow-hidden">
          {currentUser?.shopLogo ? (
              <img src={currentUser.shopLogo} alt="Shop Logo" className="h-10 w-10 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-600" />
          ) : (
              <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 ring-2 ring-slate-600">
                  {currentUser?.shopName?.charAt(0).toUpperCase()}
              </div>
          )}
          <div className={`transition-opacity duration-200 ${isExpanded || isMobileOpen ? 'opacity-100' : 'opacity-0'}`}>
              <h1 className="text-lg font-bold text-white truncate whitespace-nowrap">{currentUser?.shopName}</h1>
              <p className="text-xs text-slate-400 truncate whitespace-nowrap">{currentUser?.name}</p>
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-4">
          {navItems.map(item => (
            <button
              key={item.view}
              onClick={() => handleItemClick(item.view)}
              className={`w-full flex items-center py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group ${
                isExpanded || isMobileOpen ? 'px-4' : 'justify-center'
              } ${
                currentView === item.view
                  ? 'bg-primary-600/90 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
              aria-current={currentView === item.view ? 'page' : undefined}
            >
               {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: `w-6 h-6 flex-shrink-0 transition-colors ${currentView === item.view ? 'text-white' : 'text-slate-400 group-hover:text-white'}` })}
              <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 ${isExpanded || isMobileOpen ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-700">
          <button
            onClick={logout}
            className={`w-full flex items-center py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group text-slate-400 hover:bg-red-500/10 hover:text-red-400 ${
              isExpanded || isMobileOpen ? 'px-4' : 'justify-center'
            }`}
          >
            <LogoutIcon className="w-6 h-6 flex-shrink-0 text-slate-400 group-hover:text-red-400 transition-colors" />
            <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 ${isExpanded || isMobileOpen ? 'opacity-100' : 'opacity-0'}`}>{t('sidebar.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;