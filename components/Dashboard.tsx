import React, { useState, useEffect } from 'react';
import type { InventoryHook } from '../types';
import Card from './ui/Card';
import { WarningIcon, ExpirationIcon, CheckCircleIcon, ProductsIcon, RevenueIcon } from './icons/Icons';
import { useTranslation } from '../hooks/useTranslation';

const Dashboard: React.FC<InventoryHook> = ({ products, sales }) => {
  const { t, language } = useTranslation();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getLocaleForLanguage = (lang: string) => {
    switch(lang) {
      case 'hi': return 'hi-IN';
      case 'kn': return 'kn-IN';
      default: return 'en-IN';
    }
  }

  const formattedDateTime = currentDateTime.toLocaleString(getLocaleForLanguage(language), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const [datePart, timePart] = formattedDateTime.split(' at ');
  
  const totalProducts = products.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);

  const getDaysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return Infinity;
    const today = new Date();
    const expiry = new Date(expiryDate);
    expiry.setHours(23, 59, 59, 999);
    return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  const expiringSoonProducts = products
    .filter(p => {
        if (!p.expiryDate) return false;
        const daysLeft = getDaysUntilExpiry(p.expiryDate);
        return daysLeft >= 0 && daysLeft <= 30;
    })
    .sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate));

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <p className="text-slate-500 dark:text-slate-400">{t('dashboard.welcome_message')}</p>
        <div className="text-left md:text-right flex-shrink-0 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-base text-slate-800 dark:text-slate-200">{datePart}</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs">{timePart}</p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div style={{ '--stagger-delay': '100ms' } as React.CSSProperties} data-stagger>
          <Card 
            title={t('dashboard.total_products')}
            value={totalProducts.toString()}
            description={t('dashboard.different_items_in_stock')}
            icon={<ProductsIcon className="w-7 h-7 text-primary-600 dark:text-primary-300" />}
          />
        </div>
        <div style={{ '--stagger-delay': '200ms' } as React.CSSProperties} data-stagger>
          <Card 
            title={t('dashboard.total_revenue')}
            value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            description={t('dashboard.total_revenue_description')}
            icon={<RevenueIcon className="w-7 h-7 text-primary-600 dark:text-primary-300" />}
          />
        </div>
        <div style={{ '--stagger-delay': '300ms' } as React.CSSProperties} data-stagger>
          <Card 
            title={t('dashboard.low_stock_alerts')}
            value={lowStockProducts.length.toString()}
            description={t('dashboard.items_needing_restock')}
            isWarning={lowStockProducts.length > 0}
            icon={<WarningIcon className="w-7 h-7 text-red-500" />}
          />
        </div>
        <div style={{ '--stagger-delay': '400ms' } as React.CSSProperties} data-stagger>
          <Card 
            title={t('dashboard.expiring_soon')}
            value={expiringSoonProducts.length.toString()}
            description={t('dashboard.items_expiring_in_30_days')}
            isWarning={expiringSoonProducts.length > 0}
            icon={<ExpirationIcon className="w-7 h-7 text-red-500" />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Products */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center">
            <WarningIcon className="mr-3 text-red-500" /> {t('dashboard.low_stock_products_title')}
          </h2>
          <div className="p-6">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">{t('dashboard.all_products_well_stocked')}</p>
              </div>
            ) : (
              <ul className="space-y-3 max-h-80 overflow-y-auto">
                {lowStockProducts.map((product, index) => (
                  <li key={product.id} data-stagger style={{ '--stagger-delay': `${100 + index * 50}ms` } as React.CSSProperties} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-4 flex-shrink-0"></div>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{product.category}</p>
                        </div>
                    </div>
                    <p className="text-red-500 font-bold text-lg">{product.stock}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Expiring Soon Products */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center">
            <ExpirationIcon className="mr-3 text-yellow-500" /> {t('dashboard.expiring_soon_title')}
          </h2>
          <div className="p-6">
            {expiringSoonProducts.length === 0 ? (
              <div className="text-center py-4">
                 <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                 <p className="text-slate-500 dark:text-slate-400">{t('dashboard.no_products_expiring_soon')}</p>
              </div>
            ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto">
                {expiringSoonProducts.map((product, index) => {
                  const daysLeft = getDaysUntilExpiry(product.expiryDate);
                  const isUrgent = daysLeft <= 1;

                  const urgencyText = daysLeft === 0
                    ? t('dashboard.expires_today')
                    : t('dashboard.days_left').replace('{days}', daysLeft.toString());
                  
                  const colorClass = isUrgent ? 'bg-red-500' : 'bg-yellow-500';

                  return (
                    <li key={product.id} data-stagger style={{ '--stagger-delay': `${100 + index * 50}ms` } as React.CSSProperties} className={`flex justify-between items-center p-3 rounded-lg transition-colors bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700`}>
                       <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${colorClass} mr-4 flex-shrink-0`}></div>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(product.expiryDate!).toLocaleDateString('en-IN')}</p>
                            </div>
                        </div>
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-sm ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                          {urgencyText}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;