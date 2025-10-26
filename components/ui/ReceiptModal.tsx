import React from 'react';
import type { Sale, User } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from './Modal';
import Button from './Button';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
  user: User;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, sale, user }) => {
  const { t } = useTranslation();

  const handlePrint = () => {
    const placeholderSVG = `
      <div id="receipt-logo-placeholder">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9.5l9-7 9 7V21a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 21 9 12 15 12 15 21"></polyline>
        </svg>
      </div>
    `;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${sale.id.slice(0, 8)}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 4mm;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 10pt;
              color: #000;
              background-color: #fff;
            }
            #receipt-wrapper {
              max-width: 300px;
              margin: 0 auto;
            }
            #receipt-header { text-align: center; margin-bottom: 1rem; }
            #receipt-logo { width: 4rem; height: 4rem; margin: 0 auto 0.5rem; border-radius: 9999px; object-fit: cover; }
            #receipt-shop-name { font-size: 1.25rem; font-weight: 700; }
            .receipt-shop-details { font-size: 0.875rem; margin: 2px 0; }
            #receipt-meta { border-top: 1px dashed #333; border-bottom: 1px dashed #333; margin: 1rem 0; padding: 0.5rem 0; font-size: 0.875rem; }
            .meta-row { display: flex; justify-content: space-between; }
            #receipt-items-table { width: 100%; font-size: 0.875rem; margin: 1rem 0; border-collapse: collapse; }
            #receipt-items-table thead tr { border-bottom: 1px solid #333; }
            #receipt-items-table th { padding: 0.5rem 0.1rem; font-weight: 600; }
            #receipt-items-table td { padding: 0.25rem 0.1rem; vertical-align: top; }
            #receipt-items-table th:nth-child(1), #receipt-items-table td:nth-child(1) { text-align: left; width: 50%; word-break: break-all; }
            #receipt-items-table th:nth-child(2), #receipt-items-table td:nth-child(2) { text-align: center; }
            #receipt-items-table th:nth-child(3), #receipt-items-table td:nth-child(3), #receipt-items-table th:nth-child(4), #receipt-items-table td:nth-child(4) { text-align: right; }
            #receipt-totals { border-top: 1px dashed #333; padding-top: 1rem; margin-top: 1rem; font-size: 0.875rem; }
            .totals-row { display: flex; justify-content: space-between; margin-top: 0.25rem; }
            #receipt-grand-total { display: flex; justify-content: space-between; font-weight: 700; font-size: 1.125rem; border-top: 1px solid #333; padding-top: 0.5rem; margin-top: 0.5rem; }
            #receipt-footer { text-align: center; font-size: 0.75rem; margin-top: 1.5rem; }
            #receipt-logo-placeholder { width: 4rem; height: 4rem; margin: 0 auto 0.5rem; border-radius: 9999px; background-color: #f1f5f9; display: flex; align-items: center; justify-content: center; }
          </style>
        </head>
        <body>
          <div id="receipt-wrapper">
            <header id="receipt-header">
              ${user.shopLogo
                ? `<img src="${user.shopLogo}" alt="Shop Logo" id="receipt-logo" />`
                : placeholderSVG
              }
              <h1 id="receipt-shop-name">${user.shopName}</h1>
              <p class="receipt-shop-details">${user.shopAddress}</p>
              ${user.phoneNumber ? `<p class="receipt-shop-details">Phone: ${user.phoneNumber}</p>` : ''}
              ${user.gstNumber ? `<p class="receipt-shop-details">GSTIN: ${user.gstNumber}</p>` : ''}
            </header>
            
            <div id="receipt-meta">
              <div class="meta-row">
                <span>${t('pos.receipt.receipt_no')}:</span>
                <span>${sale.id.slice(0, 8)}</span>
              </div>
              <div class="meta-row">
                <span>${t('pos.receipt.date')}:</span>
                <span>${new Date(sale.date).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <table id="receipt-items-table">
              <thead>
                <tr>
                  <th>${t('pos.receipt.item')}</th>
                  <th>${t('pos.receipt.qty')}</th>
                  <th>${t('pos.receipt.price')}</th>
                  <th>${t('pos.receipt.total')}</th>
                </tr>
              </thead>
              <tbody>
                ${sale.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div id="receipt-totals">
              <div class="totals-row">
                <span>${t('pos.subtotal_label')}</span>
                <span>₹${sale.subtotal.toFixed(2)}</span>
              </div>
              ${sale.discountAmount && sale.discountAmount > 0 ? `
                <div class="totals-row">
                  <span>
                    ${t('pos.discount_label')}
                    ${sale.discountType === 'percentage' ? ` (${sale.discountValue}%)` : ''}
                  </span>
                  <span>- ₹${sale.discountAmount.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="totals-row">
                <span>${t('pos.tax_label').replace('{taxRate}', user.taxRate.toString())}</span>
                <span>₹${sale.taxAmount.toFixed(2)}</span>
              </div>
              <div id="receipt-grand-total">
                <span>${t('pos.total_label')}</span>
                <span>₹${sale.total.toFixed(2)}</span>
              </div>
            </div>

            <p id="receipt-footer">${t('pos.receipt.thank_you')}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('pos.receipt.title')}>
      <>
        {/* This is the on-screen preview. The print version is generated separately. */}
        <div className="text-slate-800 dark:text-slate-200">
          <div className="max-h-[60vh] overflow-y-auto p-1 pr-4">
              <header className="text-center mb-6">
                {/* Visual content for the modal can use existing components and styles */}
              </header>
              {/* Simplified preview for the modal window */}
              <div className="font-mono text-sm">
                <div className="text-center mb-4">
                    <h2 className="font-bold text-lg">{user.shopName}</h2>
                    <p className="text-xs">{user.shopAddress}</p>
                </div>
                <div className="border-t border-b border-dashed border-slate-300 dark:border-slate-600 py-1 my-2">
                    <p>Receipt: {sale.id.slice(0, 8)}</p>
                    <p>Date: {new Date(sale.date).toLocaleString('en-IN')}</p>
                </div>
                 <ul className="my-2">
                    {sale.items.map(item => (
                        <li key={item.productId} className="flex justify-between">
                            <span>{item.name} x{item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <div className="border-t border-dashed border-slate-300 dark:border-slate-600 pt-2 mt-2">
                    <div className="flex justify-between"><span>Subtotal</span><span>₹{sale.subtotal.toFixed(2)}</span></div>
                    {sale.discountAmount && sale.discountAmount > 0 && (
                        <div className="flex justify-between"><span>Discount</span><span>- ₹{sale.discountAmount.toFixed(2)}</span></div>
                    )}
                    <div className="flex justify-between"><span>Tax</span><span>₹{sale.taxAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-base mt-1"><span>Total</span><span>₹{sale.total.toFixed(2)}</span></div>
                </div>
              </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-4 border-t border-slate-200 dark:border-slate-700 mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>{t('common.close')}</Button>
          <Button type="button" onClick={handlePrint}>{t('common.print')}</Button>
        </div>
      </>
    </Modal>
  );
};

export default ReceiptModal;