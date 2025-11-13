import React from 'react';

interface CardProps {
  title: string;
  value: string;
  description: string;
  isWarning?: boolean;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, description, isWarning = false, action, icon }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 relative transition-all duration-300 hover:shadow-primary-500/10 hover:-translate-y-1.5">
      {action && <div className="absolute top-4 right-4 z-10">{action}</div>}
      <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">{title}</h3>
            <p className={`mt-1 text-4xl font-bold ${isWarning ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{value}</p>
          </div>
          {icon && (
            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/50 dark:to-primary-800/50 text-primary-500`}>
              {/* FIX: Added a more specific type to the icon element to resolve cloneElement typing error. */}
              {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-7 h-7" })}
            </div>
          )}
      </div>
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
};

export default Card;