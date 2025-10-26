import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';
import type { View } from '../types';
import { MenuIcon } from './icons/Icons';

interface HeaderProps {
  currentView: View;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onMenuClick }) => {
  const { t } = useTranslation();

  const viewTitles: Record<View, string> = {
    dashboard: t('sidebar.dashboard'),
    products: t('sidebar.products'),
    pos: t('sidebar.pos'),
    reports: t('sidebar.reports'),
    settings: t('sidebar.settings'),
  };

  return (
    <header className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-lg p-4 lg:px-8 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
            <button 
                onClick={onMenuClick} 
                className="lg:hidden mr-4 p-2 -ml-2 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
                aria-label="Open menu"
            >
                <MenuIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 capitalize">
                {viewTitles[currentView]}
            </h1>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;