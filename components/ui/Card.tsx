import React from 'react';

interface CardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  isWarning?: boolean;
}

const Card: React.FC<CardProps> = ({ title, value, description, icon, isWarning = false }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 flex items-center space-x-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center ${isWarning ? 'bg-red-100 dark:bg-red-900/50' : 'bg-primary-100 dark:bg-primary-900/50'}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <p className={`mt-1 text-3xl font-bold ${isWarning ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{value}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
};

export default Card;