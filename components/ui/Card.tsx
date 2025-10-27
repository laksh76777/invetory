import React from 'react';

interface CardProps {
  title: string;
  value: string;
  description: string;
  isWarning?: boolean;
  action?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, description, isWarning = false, action }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 relative">
      {action && <div className="absolute top-4 right-4">{action}</div>}
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
      <p className={`mt-1 text-3xl font-semibold ${isWarning ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
};

export default Card;