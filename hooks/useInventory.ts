import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Product, Sale, SaleItem, InventoryHook } from '../types';

const getInitialProducts = (): Product[] => [
  { id: 'prod-1', name: 'Organic Milk', category: 'Dairy', price: 60, stock: 50, lowStockThreshold: 10, expiryDate: '2024-09-15', barcode: '8901234567890' },
  { id: 'prod-2', name: 'Brown Bread', category: 'Bakery', price: 45, stock: 30, lowStockThreshold: 12, expiryDate: '2024-08-28', barcode: '8902345678901' },
  { id: 'prod-3', name: 'Cheddar Cheese', category: 'Dairy', price: 250, stock: 20, lowStockThreshold: 5, expiryDate: '2024-11-20', barcode: '8903456789012' },
  { id: 'prod-4', name: 'Fresh Apples', category: 'Produce', price: 150, stock: 100, lowStockThreshold: 20, expiryDate: '2024-09-05', barcode: '8904567890123' },
  { id: 'prod-5', name: 'Instant Noodles', category: 'Pantry', price: 25, stock: 80, lowStockThreshold: 25, expiryDate: '2025-07-01', barcode: '8905678901234' },
  { id: 'prod-6', name: 'Coca-Cola (Can)', category: 'Beverages', price: 40, stock: 120, lowStockThreshold: 30, expiryDate: '2025-12-31', barcode: '8906789012345' },
  { id: 'prod-7', name: 'Lays Chips', category: 'Snacks', price: 15, stock: 15, lowStockThreshold: 10, expiryDate: '2025-06-30', barcode: '8907890123456' },
  { id: 'prod-8', name: 'Basmati Rice (1kg)', category: 'Grains', price: 120, stock: 40, lowStockThreshold: 15, expiryDate: '2026-01-01', barcode: '8908901234567' },
];

const getInitialSales = (userId: string): Sale[] => {
    // Generate some sales for the last 7 days
    const sales: Sale[] = [];
    const taxRate = 5; // Assume 5% tax for demo sales
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dailySalesCount = Math.floor(Math.random() * 5) + 2; // 2 to 6 sales per day
        for (let j = 0; j < dailySalesCount; j++) {
            const items: SaleItem[] = [{ productId: 'prod-1', name: 'Organic Milk', quantity: Math.floor(Math.random() * 2) + 1, price: 60 }, { productId: 'prod-2', name: 'Brown Bread', quantity: 1, price: 45 }];
            const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
            const taxAmount = subtotal * (taxRate / 100);
            const total = subtotal + taxAmount;
            sales.push({ id: uuidv4(), date: date.toISOString(), items, subtotal, taxAmount, total, userId });
        }
    }
    return sales;
};

const useInventory = (userId: string | null): InventoryHook => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    };

    try {
      const savedProducts = localStorage.getItem(`products_${userId}`);
      const savedSales = localStorage.getItem(`sales_${userId}`);
      
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        // Seed initial data only for the demo user ('user-1').
        if (userId === 'user-1') {
            setProducts(getInitialProducts());
        } else {
            setProducts([]);
        }
      }

      if (savedSales) {
        setSales(JSON.parse(savedSales));
      } else {
        // Seed initial sales only for the demo user ('user-1').
        if (userId === 'user-1') {
            setSales(getInitialSales(userId));
        } else {
            setSales([]);
        }
      }
    } catch (error) {
        console.error("Failed to load inventory from localStorage", error);
        // Fallback to empty state if localStorage is corrupt, unless it's the demo user.
        if (userId === 'user-1') {
            setProducts(getInitialProducts());
            setSales(getInitialSales(userId));
        } else {
            setProducts([]);
            setSales([]);
        }
    } finally {
        setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || loading) return;
    try {
      localStorage.setItem(`products_${userId}`, JSON.stringify(products));
    } catch (error) {
        console.error("Failed to save products to localStorage", error);
    }
  }, [products, userId, loading]);
  
  useEffect(() => {
    if (!userId || loading) return;
    try {
      localStorage.setItem(`sales_${userId}`, JSON.stringify(sales));
    } catch (error) {
        console.error("Failed to save sales to localStorage", error);
    }
  }, [sales, userId, loading]);

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...productData, id: uuidv4() };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const addSale = (
    items: SaleItem[], 
    subtotal: number, 
    taxAmount: number, 
    total: number, 
    discount?: { value: number; type: 'percentage' | 'fixed'; amount: number }
  ): Sale => {
    if (!userId) {
      throw new Error("User not logged in");
    }
    
    // Create new sale record
    const newSale: Sale = {
      id: uuidv4(),
      date: new Date().toISOString(),
      items,
      subtotal,
      taxAmount,
      total,
      userId,
      discountAmount: discount?.amount,
      discountType: discount?.type,
      discountValue: discount?.value,
    };
    setSales(prev => [...prev, newSale]);

    // Update product stock
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      items.forEach(saleItem => {
        const productIndex = updatedProducts.findIndex(p => p.id === saleItem.productId);
        if (productIndex !== -1) {
          updatedProducts[productIndex].stock -= saleItem.quantity;
        }
      });
      return updatedProducts;
    });

    return newSale;
  };

  return { products, sales, addProduct, updateProduct, deleteProduct, addSale, loading };
};

export default useInventory;