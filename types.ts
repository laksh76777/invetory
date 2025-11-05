// FIX: Removed circular import of 'Sale' type which was causing a conflict.
export interface User {
  id: string;
  email: string;
  name: string;
  shopName: string;
  shopLogo?: string;
  shopAddress: string;
  phoneNumber?: string;
  gstNumber?: string;
  taxRate: number; // as a percentage, e.g., 18 for 18%
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  expiryDate: string;
  barcode: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  date: string; // ISO 8601 format
  items: SaleItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  userId: string;
  discountAmount?: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
}

export type View = 'dashboard' | 'products' | 'pos' | 'reports' | 'settings' | 'ai_chatbot';

export interface InventoryHook {
  products: Product[];
  sales: Sale[];
  addProduct: (product: Omit<Product, 'id'>) => { success: boolean; error?: string };
  updateProduct: (product: Product) => { success: boolean; error?: string };
  deleteProduct: (productId: string) => void;
  addSale: (
    items: SaleItem[], 
    subtotal: number, 
    taxAmount: number, 
    total: number, 
    discount?: { value: number; type: 'percentage' | 'fixed'; amount: number }
  ) => Sale;
  clearSalesData: () => void;
  resetDashboardRevenue: () => void;
  revenueResetTimestamp: string | null;
}

export type ThemeMode = 'light' | 'dark' | 'system';