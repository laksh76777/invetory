import React, { useState, useMemo } from 'react';
import type { InventoryHook, Product, SaleItem, User, Sale } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import Button from './ui/Button';
import { ShoppingCartIcon, TrashIcon, PlusCircleIcon } from './icons/Icons';
import ReceiptModal from './ui/ReceiptModal';

const PointOfSale: React.FC<Omit<InventoryHook, 'loading'> & { currentUser: User }> = ({ products, addSale, currentUser }) => {
  const { t } = useTranslation();
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanError, setScanError] = useState('');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null);
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');

  const taxRate = currentUser.taxRate || 0;

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevCart.map(item =>
            item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return prevCart; // Don't add more than available in stock
      } else {
        return [...prevCart, { productId: product.id, name: product.name, quantity: 1, price: product.price }];
      }
    });
    // Trigger animation for visual feedback
    setLastAddedProductId(product.id);
    setTimeout(() => setLastAddedProductId(null), 1500);
  };

  const findAndAddProduct = (barcode: string) => {
    if (!barcode) return false;
    const product = products.find(p => p.barcode === barcode);

    if (!product) {
      setScanError(t('pos.product_not_found_alert'));
      return false;
    }

    if (product.stock <= 0) {
      setScanError(t('pos.product_out_of_stock_alert'));
      return false;
    }

    addToCart(product);
    setScanError('');
    return true;
  }

  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (findAndAddProduct(barcodeInput.trim())) {
          setBarcodeInput('');
      }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    } else if (newQuantity <= product.stock) {
      setCart(prevCart => prevCart.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
    // Do nothing if new quantity exceeds stock
  };

  const { subtotal, discountAmount, subtotalAfterDiscount, taxAmount, total } = useMemo(() => {
    const sub = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    let discAmount = 0;
    const parsedDiscount = parseFloat(discount) || 0;

    if (parsedDiscount > 0) {
        if (discountType === 'percentage') {
            discAmount = sub * (parsedDiscount / 100);
        } else { // fixed
            discAmount = parsedDiscount;
        }
    }
    discAmount = Math.max(0, Math.min(sub, discAmount));
    
    const subAfterDisc = sub - discAmount;
    const tax = subAfterDisc * (taxRate / 100);
    const grandTotal = subAfterDisc + tax;
    
    return { 
        subtotal: sub, 
        discountAmount: discAmount, 
        subtotalAfterDiscount: subAfterDisc,
        taxAmount: tax, 
        total: grandTotal 
    };
  }, [cart, taxRate, discount, discountType]);

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    
    const discountDetails = discountAmount > 0 ? {
        value: parseFloat(discount) || 0,
        type: discountType,
        amount: discountAmount,
    } : undefined;

    const completedSale = addSale(cart, subtotal, taxAmount, total, discountDetails);
    setLastSale(completedSale);
    setIsReceiptModalOpen(true);
  };
  
  const handleCloseReceipt = () => {
    setIsReceiptModalOpen(false);
    setLastSale(null);
    setCart([]);
    setDiscount('');
  }

  return (
    <>
      <style>{`
        @keyframes highlight-item {
          from { 
            background-color: transparent;
          }
          50% { 
            background-color: rgb(var(--color-primary-100) / 0.5);
            transform: scale(1.02);
          }
          to {
            background-color: transparent;
          }
        }
        .animate-highlight {
          animation: highlight-item 1.5s ease-out;
        }
      `}</style>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Barcode Input */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-lg text-center">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">{t('pos.scan_or_enter_barcode')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{t('pos.main_instruction')}</p>
            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder={t('pos.search_placeholder')}
                value={barcodeInput}
                onChange={(e) => { setBarcodeInput(e.target.value); setScanError(''); }}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 transition text-lg font-mono"
                autoFocus
              />
              <Button type="submit" className="!px-4 !py-3" aria-label="Add product">
                <PlusCircleIcon className="w-6 h-6" />
              </Button>
            </form>
            {scanError && <p className="text-red-500 mt-4 font-semibold">{scanError}</p>}
          </div>
        </div>


        {/* Cart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex flex-col">
          <h2 className="text-xl font-bold p-4 border-b border-slate-200 dark:border-slate-700 flex items-center text-slate-800 dark:text-slate-200">
              <ShoppingCartIcon className="mr-3" /> {t('pos.cart_title')}
          </h2>
          <div className="flex-1 p-4 overflow-y-auto">
              {cart.length === 0 ? (
                  <div className="text-center py-10 h-full flex flex-col justify-center">
                      <p className="text-slate-500 dark:text-slate-400">{t('pos.cart_empty')}</p>
                  </div>
              ) : (
                  <ul className="space-y-4">
                      {cart.map(item => (
                          <li key={item.productId} className={`flex items-center justify-between p-2 -mx-2 rounded-lg transition-colors ${item.productId === lastAddedProductId ? 'animate-highlight' : ''}`}>
                              <div className="flex-1 pr-2">
                                  <p className="font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">₹{item.price.toFixed(2)}</p>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2">
                                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="h-8 w-8 flex items-center justify-center border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition">-</button>
                                  <span className="w-6 text-center">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="h-8 w-8 flex items-center justify-center border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition">+</button>
                                  <button onClick={() => updateQuantity(item.productId, 0)} className="text-slate-500 hover:text-red-500 ml-1 sm:ml-2 transition p-1"><TrashIcon className="w-5 h-5" /></button>
                              </div>
                          </li>
                      ))}
                  </ul>
              )}
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>{t('pos.subtotal_label')}</span>
                  <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600 dark:text-slate-300 gap-2">
                <label htmlFor="discount" className="font-medium flex-shrink-0">{t('pos.discount_label')}</label>
                <div className="flex items-center gap-1">
                    <input
                        id="discount"
                        type="number"
                        placeholder="0"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-full p-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 transition text-right"
                        min="0"
                    />
                    <button
                        onClick={() => setDiscountType(prev => prev === 'fixed' ? 'percentage' : 'fixed')}
                        className="h-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition font-bold"
                    >
                        {discountType === 'fixed' ? '₹' : '%'}
                    </button>
                </div>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>{t('pos.discount_applied')}</span>
                    <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>{t('pos.tax_label').replace('{taxRate}', taxRate.toString())}</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                  <span>{t('pos.total_label')}</span>
                  <span>₹{total.toFixed(2)}</span>
              </div>
              <Button className="w-full !py-3 !text-base" onClick={handleCompleteSale} disabled={cart.length === 0}>
                {t('pos.complete_sale_button')}
              </Button>
          </div>
        </div>
      </div>
      {isReceiptModalOpen && lastSale && (
          <ReceiptModal
              isOpen={isReceiptModalOpen}
              onClose={handleCloseReceipt}
              sale={lastSale}
              user={currentUser}
          />
      )}
    </>
  );
};

export default PointOfSale;