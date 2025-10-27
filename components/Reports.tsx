import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { InventoryHook } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import Card from './ui/Card';

type Period = 'week' | 'month' | 'year';

const Reports: React.FC<InventoryHook> = ({ sales }) => {
    const { t } = useTranslation();
    // FIX: Renamed state variable to avoid shadowing and fix comparison logic.
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
        
        if (activePeriod === 'week') {
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d;
            }).reverse();
            
            filteredSales = sales.filter(s => new Date(s.date) >= last7Days[0]);
            chartData = last7Days.map(day => {
                const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
                const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
                const daySales = sales.filter(s => {
                    const saleDate = new Date(s.date);
                    return saleDate >= dayStart && saleDate < dayEnd;
                });
                return {
                    name: day.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                    revenue: daySales.reduce((sum, s) => sum + s.total, 0)
                };
            });

        } else if (activePeriod === 'month') {
            const last30Days = Array.from({ length: 30 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d;
            }).reverse();

            filteredSales = sales.filter(s => new Date(s.date) >= last30Days[0]);
            chartData = last30Days.map(day => {
                const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
                const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
                const daySales = sales.filter(s => {
                    const saleDate = new Date(s.date);
                    return saleDate >= dayStart && saleDate < dayEnd;
                });
                return {
                    name: day.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                    revenue: daySales.reduce((sum, s) => sum + s.total, 0)
                };
            });
        } else if (activePeriod === 'year') {
            const last12Months = Array.from({ length: 12 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                return d;
            }).reverse();

            filteredSales = sales.filter(s => new Date(s.date) >= last12Months[0]);
            chartData = last12Months.map(month => {
                const monthSales = sales.filter(s => {
                    const saleDate = new Date(s.date);
                    return saleDate.getFullYear() === month.getFullYear() && saleDate.getMonth() === month.getMonth();
                });
                 return {
                    name: month.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
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

        return { todayRevenue, monthRevenue, yearRevenue, chartData, topSellingProducts };
    }, [sales, activePeriod]);

    const PeriodButton: React.FC<{ period: Period, label: string }> = ({ period, label }) => (
      <button
        onClick={() => setActivePeriod(period)}
        className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
          activePeriod === period
            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
      >
        {label}
      </button>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">{t('reports.title')}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card 
                    title={t('reports.todays_revenue')}
                    value={`₹${reportData.todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    description={t('reports.summary_description')}
                />
                 <Card 
                    title={t('reports.this_months_revenue')}
                    value={`₹${reportData.monthRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    description={t('reports.summary_description')}
                />
                 <Card 
                    title={t('reports.this_years_revenue')}
                    value={`₹${reportData.yearRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    description={t('reports.summary_description')}
                />
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-slate-200 dark:border-slate-700 gap-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('reports.sales_over_time')}</h2>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
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
                                    backgroundColor: 'rgb(2 6 23)',
                                    border: '1px solid rgb(51 65 85)',
                                    borderRadius: '0.5rem',
                                    color: 'white'
                                }}
                                labelStyle={{ fontWeight: 'bold' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" name={t('reports.revenue')} stroke="rgb(var(--color-primary-500))" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t('reports.top_selling_products')}</h2>
                 <ul className="space-y-2">
                    {reportData.topSellingProducts.map((product, index) => (
                        <li key={product.name} className="flex justify-between items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            <div className="flex items-center">
                                <span className="text-lg font-bold text-primary-500 mr-4 w-6">#{index + 1}</span>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      {t('reports.total_revenue')}: ₹{product.revenue.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{t('reports.units_sold').replace('{quantity}', product.quantity.toString())}</p>
                        </li>
                    ))}
                </ul>
                 {reportData.topSellingProducts.length === 0 && (
                    <p className="p-6 text-center text-slate-500 dark:text-slate-400">{t('reports.no_sales_data')}</p>
                )}
            </div>
        </div>
    );
};

export default Reports;