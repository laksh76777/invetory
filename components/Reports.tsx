import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { InventoryHook } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import Card from './ui/Card';
import { RevenueIcon } from './icons/Icons';

type Period = 'week' | 'month' | 'year';

const Reports: React.FC<InventoryHook> = ({ sales }) => {
    const { t } = useTranslation();
    const [activePeriod, setActivePeriod] = useState<Period>('week');

    const reportData = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisYearStart = new Date(now.getFullYear(), 0, 1);

        const todaySales = sales.filter(s => new Date(s.date) >= todayStart);
        const monthSales = sales.filter(s => new Date(s.date) >= thisMonthStart);
        const yearSales = sales.filter(s => new Date(s.date) >= thisYearStart);

        const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
        const monthRevenue = monthSales.reduce((sum, s) => sum + s.total, 0);
        const yearRevenue = yearSales.reduce((sum, s) => sum + s.total, 0);
        
        // Chart and Top Products data
        let filteredSales = [];
        let chartData: { name: string, revenue: number }[] = [];
        let topProductsTitleKey = 'reports.top_selling_products';
        let topProductsTitleOptions: { period?: string } = {};
        
        if (activePeriod === 'week') {
            topProductsTitleKey = 'reports.top_selling_products_period';
            topProductsTitleOptions = { period: t('reports.period.this_week') };

            const currentDayOfWeek = now.getDay(); // Sunday - 0, Saturday - 6
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1)); // Start on Monday
            weekStart.setHours(0, 0, 0, 0);

            const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(weekStart);
                d.setDate(weekStart.getDate() + i);
                return d;
            });
            
            const weekEnd = new Date(daysOfWeek[6]);
            weekEnd.setHours(23, 59, 59, 999);
            
            filteredSales = sales.filter(s => {
                const saleDate = new Date(s.date);
                return saleDate >= weekStart && saleDate <= weekEnd;
            });

            chartData = daysOfWeek.map(day => {
                const dayStart = new Date(day);
                const dayEnd = new Date(day);
                dayEnd.setHours(23, 59, 59, 999);

                const daySales = filteredSales.filter(s => {
                    const saleDate = new Date(s.date);
                    return saleDate >= dayStart && saleDate <= dayEnd;
                });
                return {
                    name: day.toLocaleDateString('en-IN', { weekday: 'short' }),
                    revenue: daySales.reduce((sum, s) => sum + s.total, 0)
                };
            });

        } else if (activePeriod === 'month') {
            topProductsTitleKey = 'reports.top_selling_products_period';
            topProductsTitleOptions = { period: t('reports.period.this_month') };
            
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const daysInMonth = monthEnd.getDate();

            const daysOfMonth = Array.from({ length: daysInMonth }, (_, i) => new Date(now.getFullYear(), now.getMonth(), i + 1));
            
            filteredSales = sales.filter(s => new Date(s.date) >= thisMonthStart);

            chartData = daysOfMonth.map(day => {
                const dayStart = new Date(day);
                const dayEnd = new Date(day);
                dayEnd.setHours(23, 59, 59, 999);
                const daySales = filteredSales.filter(s => {
                    const saleDate = new Date(s.date);
                    return saleDate >= dayStart && saleDate <= dayEnd;
                });
                return {
                    name: day.getDate().toString(),
                    revenue: daySales.reduce((sum, s) => sum + s.total, 0)
                };
            });

        } else if (activePeriod === 'year') {
            topProductsTitleKey = 'reports.top_selling_products_period';
            topProductsTitleOptions = { period: t('reports.period.this_year') };

            const monthsOfYear = Array.from({ length: 12 }, (_, i) => new Date(now.getFullYear(), i, 1));
            
            filteredSales = sales.filter(s => new Date(s.date) >= thisYearStart);
            chartData = monthsOfYear.map(month => {
                const monthSales = filteredSales.filter(s => {
                    const saleDate = new Date(s.date);
                    return saleDate.getFullYear() === month.getFullYear() && saleDate.getMonth() === month.getMonth();
                });
                 return {
                    name: month.toLocaleDateString('en-IN', { month: 'short' }),
                    revenue: monthSales.reduce((sum, s) => sum + s.total, 0)
                };
            });
        }
        
        const productSales: { [key: string]: { name: string, quantity: number, revenue: number } } = {};
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
                }
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += item.price * item.quantity;
            });
        });

        const topSellingProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        const translatedTitle = t(topProductsTitleKey);
        const topProductsTitle = topProductsTitleOptions.period
            ? translatedTitle.replace('{period}', topProductsTitleOptions.period)
            : translatedTitle;

        return { todayRevenue, monthRevenue, yearRevenue, chartData, topSellingProducts, topProductsTitle };
    }, [sales, activePeriod, t]);

    const PeriodButton: React.FC<{ period: Period, label: string }> = ({ period, label }) => (
      <button
        onClick={() => setActivePeriod(period)}
        className={`px-4 py-2 text-sm font-semibold rounded-lg capitalize transition-all duration-200 ${
          activePeriod === period
            ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
        }`}
      >
        {label}
      </button>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('reports.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Analyze your sales performance and product trends.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card 
                    title={t('reports.todays_revenue')}
                    value={`₹${reportData.todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    description={t('reports.summary_description')}
                    icon={<RevenueIcon />}
                />
                 <Card 
                    title={t('reports.this_months_revenue')}
                    value={`₹${reportData.monthRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    description={t('reports.summary_description')}
                    icon={<RevenueIcon />}
                />
                 <Card 
                    title={t('reports.this_years_revenue')}
                    value={`₹${reportData.yearRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    description={t('reports.summary_description')}
                    icon={<RevenueIcon />}
                />
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-slate-200 dark:border-slate-800 gap-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('reports.sales_over_time')}</h2>
                    <div className="flex bg-slate-100 dark:bg-slate-900/50 rounded-lg p-1 space-x-1 border border-slate-200 dark:border-slate-700">
                        <PeriodButton period="week" label={t('reports.period.this_week')} />
                        <PeriodButton period="month" label={t('reports.period.this_month')} />
                        <PeriodButton period="year" label={t('reports.period.this_year')} />
                    </div>
                </div>
                <div className="p-6">
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={reportData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" tick={{ fill: 'rgb(100 116 139)' }} />
                            <YAxis tick={{ fill: 'rgb(100 116 139)' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgb(15 23 42)', // slate-900
                                    border: '1px solid rgb(51 65 85)', // slate-700
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
                                }}
                                labelStyle={{ fontWeight: 'bold' }}
                                formatter={(value: number) => `₹${value.toFixed(2)}`}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" name={t('reports.revenue')} stroke="rgb(var(--color-primary-500))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8, style: { stroke: 'rgba(var(--color-primary-500), 0.3)', strokeWidth: 6 } }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 p-6">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{reportData.topProductsTitle}</h2>
                 <ul className="space-y-3">
                    {reportData.topSellingProducts.map((product, index) => (
                        <li key={product.name} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center">
                                <span className="text-lg font-bold text-primary-500 mr-4 w-6">#{index + 1}</span>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      {t('reports.total_revenue')}: ₹{product.revenue.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <p className="font-bold text-lg text-slate-800 dark:text-slate-200 mt-2 sm:mt-0">{t('reports.units_sold').replace('{quantity}', product.quantity.toString())}</p>

                        </li>
                    ))}
                </ul>
                 {reportData.topSellingProducts.length === 0 && (
                    <p className="p-10 text-center text-slate-500 dark:text-slate-400">{t('reports.no_sales_data')}</p>
                )}
            </div>
        </div>
    );
};

export default Reports;