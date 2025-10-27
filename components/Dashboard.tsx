import React, { useState, useEffect, useMemo } from 'react';
import type { InventoryHook, Sale } from '../types';
import Card from './ui/Card';
import { WarningIcon, ExpirationIcon, CheckCircleIcon } from './icons/Icons';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';

type Period = 'today' | 'week' | 'month' | 'all';

const Dashboard: React.FC<InventoryHook> = ({ products, sales }) => {
  const { t, language } = useTranslation();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [revenuePeriod, setRevenuePeriod] = useState<Period>('all');

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
      default: return 'en-GB'; // Use GB for day-first format
    }
  }

  const formattedDate = currentDateTime.toLocaleDateString(getLocaleForLanguage(language), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = currentDateTime.toLocaleTimeString(getLocaleForLanguage(language), {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  
  const totalProducts = products.length;

  const { totalRevenue, revenueDescription } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let filteredSales: Sale[];
    let descriptionKey: string;

    switch (revenuePeriod) {
      case 'today':
        filteredSales = sales.filter(s => new Date(s.date) >= today);
        descriptionKey = 'dashboard.total_revenue_description_today';
        break;
      case 'week':
        filteredSales = sales.filter(s => new Date(s.date) >= startOfWeek);
        descriptionKey = 'dashboard.total_revenue_description_this_week';
        break;
      case 'month':
        filteredSales = sales.filter(s => new Date(s.date) >= startOfMonth);
        descriptionKey = 'dashboard.total_revenue_description_this_month';
        break;
      case 'all':
      default:
        filteredSales = sales;
        descriptionKey = 'dashboard.total_revenue_description_all_time';
        break;
    }

    const revenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    return { totalRevenue: revenue, revenueDescription: t(descriptionKey) };
  }, [sales, revenuePeriod, t]);

  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);

  const getDaysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return Infinity;
    const today = new Date();
    const expiry = new Date(expiryDate);
    // Set expiry to end of day for consistent "days left" calculation
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

  const PeriodButton: React.FC<{ period: Period; label: string }> = ({ period, label }) => (
    <button
      onClick={() => setRevenuePeriod(period)}
      className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
        revenuePeriod === period
          ? 'bg-white dark:bg-primary-900/50 text-primary-600 dark:text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('dashboard.title')}</h1>
            <p className="text-slate-500 mt-1">{t('dashboard.welcome_message')}</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <LanguageSwitcher />
            <div className="text-right flex-shrink-0 bg-white dark:bg-slate-900 rounded-lg px-4 py-2 shadow-sm border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 whitespace-nowrap">{formattedDate}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs text-right">{formattedTime}</p>
            </div>
        </div>
      </div>

       {/* Revenue Period Filter */}
       <div className="flex justify-end mb-6">
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-full max-w-sm">
            <PeriodButton period="today" label={t('dashboard.revenue_period.today')} />
            <PeriodButton period="week" label={t('dashboard.revenue_period.this_week')} />
            <PeriodButton period="month" label={t('dashboard.revenue_period.this_month')} />
            <PeriodButton period="all" label={t('dashboard.revenue_period.all_time')} />
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card 
          title={t('dashboard.total_products')}
          value={totalProducts.toString()}
          description={t('dashboard.different_items_in_stock')}
        />
        <Card 
          title={t('dashboard.total_revenue')}
          value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description={revenueDescription}
        />
        <Card 
          title={t('dashboard.low_stock_alerts')}
          value={lowStockProducts.length.toString()}
          description={t('dashboard.items_needing_restock')}
          isWarning={lowStockProducts.length > 0}
        />
        <Card 
          title={t('dashboard.expiring_soon')}
          value={expiringSoonProducts.length.toString()}
          description={t('dashboard.items_expiring_in_30_days')}
          isWarning={expiringSoonProducts.length > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Products */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
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
              <ul className="space-y-2 max-h-80 overflow-y-auto">
                {lowStockProducts.map((product, index) => (
                  <li key={product.id} className={`flex justify-between items-center p-3 rounded-lg ${index % 2 === 0 ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{product.category}</p>
                    </div>
                    <p className="text-red-500 font-bold text-lg">{product.stock}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Expiring Soon Products */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
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
                <ul className="space-y-2 max-h-80 overflow-y-auto">
                {expiringSoonProducts.map((product, index) => {
                  const daysLeft = getDaysUntilExpiry(product.expiryDate);
                  const isUrgent = daysLeft === 0;

                  const urgencyText = isUrgent
                    ? t('dashboard.expires_today')
                    : t('dashboard.days_left').replace('{days}', daysLeft.toString());

                  return (
                    <li key={product.id} className={`flex justify-between items-center p-3 rounded-lg transition-colors ${index % 2 === 0 ? 'bg-slate-50 dark:bg-slate-700/50' : ''} ${isUrgent ? 'bg-red-100/50 dark:bg-red-900/20' : ''}`}>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(product.expiryDate!).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isUrgent && <WarningIcon className="w-5 h-5 text-red-500" />}
                        <p className={`font-semibold ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
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