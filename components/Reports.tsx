import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { InventoryHook, SaleItem } from '../types';
import { useTranslation } from '../hooks/useTranslation';

const Reports: React.FC<InventoryHook> = ({ sales }) => {
    const { t } = useTranslation();

    const salesDataLast7Days = useMemo(() => {
        const data: { [key: string]: number } = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            data[d.toISOString().split('T')[0]] = 0;
        }

        sales.forEach(sale => {
            const saleDate = new Date(sale.date);
            saleDate.setHours(0, 0, 0, 0);
            const key = saleDate.toISOString().split('T')[0];
            if (data[key] !== undefined) {
                data[key] += sale.total;
            }
        });

        return Object.keys(data).map(date => ({
            date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            revenue: data[date]
        }));
    }, [sales]);

    const topSellingProducts = useMemo(() => {
        const productSales: { [key: string]: { name: string, quantity: number, revenue: number } } = {};

        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
                }
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += item.price * item.quantity;
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    }, [sales]);

    return (
        <div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-8 border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t('reports.sales_over_time')}</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={salesDataLast7Days}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis dataKey="date" tick={{ fill: 'rgb(100 116 139)' }} />
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
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t('reports.top_selling_products')}</h2>
                 <ul className="space-y-2">
                    {topSellingProducts.map((product, index) => (
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
                 {topSellingProducts.length === 0 && (
                    <p className="p-6 text-center text-slate-500 dark:text-slate-400">{t('reports.no_sales_data')}</p>
                )}
            </div>
        </div>
    );
};

export default Reports;