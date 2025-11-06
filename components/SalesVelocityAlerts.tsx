import React, { useMemo } from 'react';
import type { Product, Sale } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { TrendingDownIcon } from './icons/Icons';

interface SalesVelocityAlertsProps {
  products: Product[];
  sales: Sale[];
}

const SalesVelocityAlerts: React.FC<SalesVelocityAlertsProps> = ({ products, sales }) => {
  const { t } = useTranslation();

  const alerts = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));
    const sixtyDaysAgo = new Date(new Date().setDate(now.getDate() - 60));

    const salesLast30: { [key: string]: number } = {};
    const salesPrevious30: { [key: string]: number } = {};

    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      let targetPeriod: { [key: string]: number } | null = null;
      if (saleDate >= thirtyDaysAgo) {
        targetPeriod = salesLast30;
      } else if (saleDate >= sixtyDaysAgo) {
        targetPeriod = salesPrevious30;
      }

      if (targetPeriod) {
        sale.items.forEach(item => {
          targetPeriod[item.productId] = (targetPeriod[item.productId] || 0) + item.quantity;
        });
      }
    });

    const velocityDrops: { name: string, previous: number, current: number }[] = [];

    Object.keys(salesPrevious30).forEach(productId => {
      const previousSales = salesPrevious30[productId];
      const currentSales = salesLast30[productId] || 0;

      // Alert if sales dropped by more than 50% and previous sales were significant
      if (previousSales > 5 && currentSales < previousSales * 0.5) {
        const product = products.find(p => p.id === productId);
        if (product) {
          velocityDrops.push({
            name: product.name,
            previous: previousSales,
            current: currentSales
          });
        }
      }
    });

    return velocityDrops;
  }, [sales, products]);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 text-amber-800 dark:text-amber-300 p-4 rounded-r-lg mb-8 shadow-md">
      <div className="flex">
        <div className="py-1">
          <TrendingDownIcon className="w-6 h-6 text-amber-500 mr-4" />
        </div>
        <div>
          <p className="font-bold">{t('sales_velocity_alerts.title')}</p>
          <ul className="mt-2 list-disc list-inside text-sm">
            {alerts.map(alert => (
              <li key={alert.name}>
                {t('sales_velocity_alerts.item_alert')
                    .replace('{productName}', alert.name)
                    .replace('{previousCount}', alert.previous.toString())
                    .replace('{currentCount}', alert.current.toString())
                }
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SalesVelocityAlerts;