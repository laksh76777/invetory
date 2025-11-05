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

const getKaggleGroceryData = (userId: string): { products: Product[], sales: Sale[] } => {
    // 1. Define Products
    const products: Product[] = [
        // Produce (20 items)
        { id: 'kg-prod-1', name: 'Banana', category: 'Produce', price: 50, stock: 200, lowStockThreshold: 30, expiryDate: '2024-09-10', barcode: '990000000001' },
        { id: 'kg-prod-2', name: 'Apple - Royal Gala', category: 'Produce', price: 180, stock: 150, lowStockThreshold: 25, expiryDate: '2024-09-20', barcode: '990000000002' },
        { id: 'kg-prod-3', name: 'Onion (1kg)', category: 'Produce', price: 40, stock: 500, lowStockThreshold: 100, expiryDate: '2024-10-15', barcode: '990000000003' },
        { id: 'kg-prod-4', name: 'Potato (1kg)', category: 'Produce', price: 35, stock: 600, lowStockThreshold: 100, expiryDate: '2024-10-20', barcode: '990000000004' },
        { id: 'kg-prod-5', name: 'Tomato (1kg)', category: 'Produce', price: 60, stock: 300, lowStockThreshold: 50, expiryDate: '2024-09-12', barcode: '990000000005' },
        { id: 'kg-prod-6', name: 'Carrot (500g)', category: 'Produce', price: 45, stock: 100, lowStockThreshold: 20, expiryDate: '2024-09-18', barcode: '990000000006' },
        { id: 'kg-prod-21', name: 'Ginger (100g)', category: 'Produce', price: 25, stock: 150, lowStockThreshold: 30, expiryDate: '2024-10-01', barcode: '990000000021' },
        { id: 'kg-prod-22', name: 'Garlic (100g)', category: 'Produce', price: 30, stock: 180, lowStockThreshold: 40, expiryDate: '2024-10-05', barcode: '990000000022' },
        { id: 'kg-prod-23', name: 'Spinach (Bunch)', category: 'Produce', price: 20, stock: 80, lowStockThreshold: 15, expiryDate: '2024-09-09', barcode: '990000000023' },
        { id: 'kg-prod-24', name: 'Cucumber (500g)', category: 'Produce', price: 30, stock: 120, lowStockThreshold: 25, expiryDate: '2024-09-14', barcode: '990000000024' },
        { id: 'kg-prod-25', name: 'Cauliflower (1pc)', category: 'Produce', price: 40, stock: 70, lowStockThreshold: 15, expiryDate: '2024-09-16', barcode: '990000000025' },
        { id: 'kg-prod-26', name: 'Capsicum - Green (250g)', category: 'Produce', price: 35, stock: 90, lowStockThreshold: 20, expiryDate: '2024-09-22', barcode: '990000000026' },
        { id: 'kg-prod-27', name: 'Lemon (4pcs)', category: 'Produce', price: 20, stock: 250, lowStockThreshold: 50, expiryDate: '2024-09-30', barcode: '990000000027' },
        { id: 'kg-prod-28', name: 'Coriander (Bunch)', category: 'Produce', price: 15, stock: 100, lowStockThreshold: 20, expiryDate: '2024-09-11', barcode: '990000000028' },
        { id: 'kg-prod-29', name: 'Watermelon (1pc)', category: 'Produce', price: 90, stock: 40, lowStockThreshold: 10, expiryDate: '2024-09-25', barcode: '990000000029' },
        { id: 'kg-prod-30', name: 'Pomegranate (1pc)', category: 'Produce', price: 120, stock: 60, lowStockThreshold: 15, expiryDate: '2024-10-10', barcode: '990000000030' },

        // Dairy & Eggs (10 items)
        { id: 'kg-prod-7', name: 'Amul Toned Milk (1L)', category: 'Dairy', price: 66, stock: 150, lowStockThreshold: 30, expiryDate: '2024-09-08', barcode: '990000000007' },
        { id: 'kg-prod-8', name: 'Amul Butter (100g)', category: 'Dairy', price: 55, stock: 200, lowStockThreshold: 40, expiryDate: '2025-03-01', barcode: '990000000008' },
        { id: 'kg-prod-9', name: 'Eggs (Dozen)', category: 'Dairy', price: 80, stock: 100, lowStockThreshold: 20, expiryDate: '2024-09-25', barcode: '990000000009' },
        { id: 'kg-prod-10', name: 'Britannia Cheese Slices', category: 'Dairy', price: 140, stock: 80, lowStockThreshold: 15, expiryDate: '2024-12-10', barcode: '990000000010' },
        { id: 'kg-prod-31', name: 'Nestle Dahi (400g)', category: 'Dairy', price: 70, stock: 90, lowStockThreshold: 20, expiryDate: '2024-09-18', barcode: '990000000031' },
        { id: 'kg-prod-32', name: 'Amul Paneer (200g)', category: 'Dairy', price: 95, stock: 110, lowStockThreshold: 25, expiryDate: '2024-11-01', barcode: '990000000032' },
        { id: 'kg-prod-33', name: 'Go Cheese Spread (200g)', category: 'Dairy', price: 120, stock: 75, lowStockThreshold: 15, expiryDate: '2025-02-15', barcode: '990000000033' },
        { id: 'kg-prod-34', name: 'Mother Dairy Lassi (200ml)', category: 'Dairy', price: 25, stock: 200, lowStockThreshold: 50, expiryDate: '2024-09-15', barcode: '990000000034' },
        { id: 'kg-prod-35', name: 'Epigamia Greek Yogurt - Strawberry (90g)', category: 'Dairy', price: 45, stock: 100, lowStockThreshold: 20, expiryDate: '2024-10-02', barcode: '990000000035' },
        
        // Pantry Staples (15 items)
        { id: 'kg-prod-12', name: 'Tata Salt (1kg)', category: 'Pantry', price: 28, stock: 300, lowStockThreshold: 50, expiryDate: '2026-08-01', barcode: '990000000012' },
        { id: 'kg-prod-13', name: 'Fortune Sunflower Oil (1L)', category: 'Pantry', price: 155, stock: 120, lowStockThreshold: 25, expiryDate: '2025-06-20', barcode: '990000000013' },
        { id: 'kg-prod-36', name: 'Saffola Gold Refined Oil (1L)', category: 'Pantry', price: 175, stock: 110, lowStockThreshold: 20, expiryDate: '2025-07-10', barcode: '990000000036' },
        { id: 'kg-prod-37', name: 'Sugar (1kg)', category: 'Pantry', price: 45, stock: 400, lowStockThreshold: 80, expiryDate: '2026-01-01', barcode: '990000000037' },
        { id: 'kg-prod-38', name: 'Maggi 2-Minute Noodles (4-pack)', category: 'Pantry', price: 56, stock: 350, lowStockThreshold: 70, expiryDate: '2025-05-01', barcode: '990000000038' },
        { id: 'kg-prod-39', name: 'Kissan Tomato Ketchup (950g)', category: 'Pantry', price: 130, stock: 150, lowStockThreshold: 30, expiryDate: '2025-04-15', barcode: '990000000039' },
        { id: 'kg-prod-40', name: 'Chings Schezwan Chutney (250g)', category: 'Pantry', price: 85, stock: 100, lowStockThreshold: 20, expiryDate: '2025-03-20', barcode: '990000000040' },
        { id: 'kg-prod-41', name: 'Organic Tattva Poha (500g)', category: 'Pantry', price: 60, stock: 90, lowStockThreshold: 18, expiryDate: '2025-02-01', barcode: '990000000041' },
        { id: 'kg-prod-42', name: 'Tata Sampann Besan (500g)', category: 'Pantry', price: 75, stock: 130, lowStockThreshold: 25, expiryDate: '2025-01-10', barcode: '990000000042' },
        { id: 'kg-prod-43', name: 'Dabur Honey (500g)', category: 'Pantry', price: 210, stock: 80, lowStockThreshold: 15, expiryDate: '2026-06-01', barcode: '990000000043' },
        { id: 'kg-prod-44', name: 'Kissan Mixed Fruit Jam (700g)', category: 'Pantry', price: 190, stock: 100, lowStockThreshold: 20, expiryDate: '2025-08-20', barcode: '990000000044' },
        { id: 'kg-prod-45', name: 'Veeba Mayonnaise (275g)', category: 'Pantry', price: 99, stock: 120, lowStockThreshold: 25, expiryDate: '2025-01-25', barcode: '990000000045' },
        { id: 'kg-prod-48', name: 'Borges Olive Oil (1L)', category: 'Pantry', price: 950, stock: 30, lowStockThreshold: 5, expiryDate: '2025-11-15', barcode: '990000000048' },
        { id: 'kg-prod-50', name: 'Idhayam Sesame Oil (500ml)', category: 'Pantry', price: 180, stock: 50, lowStockThreshold: 10, expiryDate: '2025-09-01', barcode: '990000000050' },

        // Grains & Cereals (10 items)
        { id: 'kg-prod-11', name: 'Aashirvaad Atta (5kg)', category: 'Grains', price: 250, stock: 100, lowStockThreshold: 20, expiryDate: '2025-01-15', barcode: '990000000011' },
        { id: 'kg-prod-14', name: 'Toor Dal (1kg)', category: 'Grains', price: 160, stock: 150, lowStockThreshold: 30, expiryDate: '2025-07-01', barcode: '990000000014' },
        { id: 'kg-prod-15', name: 'India Gate Basmati Rice (1kg)', category: 'Grains', price: 140, stock: 90, lowStockThreshold: 20, expiryDate: '2026-01-01', barcode: '990000000015' },
        { id: 'kg-prod-46', name: 'Kellogg\'s Corn Flakes (875g)', category: 'Grains', price: 340, stock: 70, lowStockThreshold: 15, expiryDate: '2025-06-10', barcode: '990000000046' },
        { id: 'kg-prod-47', name: 'Quaker Oats (1kg)', category: 'Grains', price: 199, stock: 100, lowStockThreshold: 20, expiryDate: '2025-07-22', barcode: '990000000047' },
        { id: 'kg-prod-51', name: 'Moong Dal (1kg)', category: 'Grains', price: 150, stock: 140, lowStockThreshold: 28, expiryDate: '2025-08-01', barcode: '990000000051' },
        { id: 'kg-prod-52', name: 'Chana Dal (1kg)', category: 'Grains', price: 130, stock: 160, lowStockThreshold: 30, expiryDate: '2025-08-05', barcode: '990000000052' },
        { id: 'kg-prod-53', name: 'Urad Dal (1kg)', category: 'Grains', price: 170, stock: 120, lowStockThreshold: 25, expiryDate: '2025-07-15', barcode: '990000000053' },
        { id: 'kg-prod-54', name: 'Rajma (500g)', category: 'Grains', price: 80, stock: 100, lowStockThreshold: 20, expiryDate: '2025-09-10', barcode: '990000000054' },
        { id: 'kg-prod-57', name: 'Fortune Chakki Fresh Atta (10kg)', category: 'Grains', price: 480, stock: 60, lowStockThreshold: 10, expiryDate: '2024-12-20', barcode: '990000000057' },

        // Snacks (10 items)
        { id: 'kg-prod-16', name: 'Lays - Magic Masala', category: 'Snacks', price: 20, stock: 400, lowStockThreshold: 80, expiryDate: '2025-02-15', barcode: '990000000016' },
        { id: 'kg-prod-17', name: 'Parle-G Biscuit', category: 'Snacks', price: 10, stock: 800, lowStockThreshold: 150, expiryDate: '2025-04-01', barcode: '990000000017' },
        { id: 'kg-prod-18', name: 'Cadbury Dairy Milk', category: 'Snacks', price: 40, stock: 300, lowStockThreshold: 50, expiryDate: '2025-05-10', barcode: '990000000018' },
        { id: 'kg-prod-61', name: 'Britannia Good Day Cashew Cookies', category: 'Snacks', price: 35, stock: 250, lowStockThreshold: 50, expiryDate: '2025-03-01', barcode: '990000000061' },
        { id: 'kg-prod-62', name: 'Sunfeast Dark Fantasy Choco Fills', category: 'Snacks', price: 45, stock: 180, lowStockThreshold: 35, expiryDate: '2025-06-01', barcode: '990000000062' },
        { id: 'kg-prod-63', name: 'Bingo! Mad Angles', category: 'Snacks', price: 20, stock: 300, lowStockThreshold: 60, expiryDate: '2025-01-20', barcode: '990000000063' },
        { id: 'kg-prod-64', name: 'Haldiram\'s Aloo Bhujia (200g)', category: 'Snacks', price: 55, stock: 200, lowStockThreshold: 40, expiryDate: '2025-04-10', barcode: '990000000064' },
        { id: 'kg-prod-65', name: 'Kurkure Masala Munch', category: 'Snacks', price: 10, stock: 500, lowStockThreshold: 100, expiryDate: '2025-02-25', barcode: '990000000065' },
        { id: 'kg-prod-66', name: 'Oreo Chocolate Creme Biscuit', category: 'Snacks', price: 30, stock: 220, lowStockThreshold: 45, expiryDate: '2025-07-01', barcode: '990000000066' },
        { id: 'kg-prod-67', name: 'Nestle KitKat (4-finger)', category: 'Snacks', price: 30, stock: 280, lowStockThreshold: 50, expiryDate: '2025-05-15', barcode: '990000000067' },

        // Beverages (5 items)
        { id: 'kg-prod-19', name: 'Coca-Cola (750ml)', category: 'Beverages', price: 40, stock: 250, lowStockThreshold: 50, expiryDate: '2025-03-20', barcode: '990000000019' },
        { id: 'kg-prod-20', name: 'Bru Instant Coffee (50g)', category: 'Beverages', price: 150, stock: 100, lowStockThreshold: 20, expiryDate: '2025-08-01', barcode: '990000000020' },
        { id: 'kg-prod-71', name: 'Tropicana 100% Orange Juice (1L)', category: 'Beverages', price: 140, stock: 80, lowStockThreshold: 15, expiryDate: '2025-01-01', barcode: '990000000071' },
        { id: 'kg-prod-72', name: 'Real Fruit Juice - Mixed Fruit (1L)', category: 'Beverages', price: 125, stock: 90, lowStockThreshold: 20, expiryDate: '2025-02-10', barcode: '990000000072' },
        { id: 'kg-prod-73', name: 'Tata Tea Gold (500g)', category: 'Beverages', price: 280, stock: 100, lowStockThreshold: 20, expiryDate: '2025-09-01', barcode: '990000000073' },

        // Spices & Masalas (10 items)
        { id: 'kg-prod-76', name: 'Everest Turmeric Powder (100g)', category: 'Spices', price: 35, stock: 200, lowStockThreshold: 40, expiryDate: '2025-10-01', barcode: '990000000076' },
        { id: 'kg-prod-77', name: 'Everest Chilli Powder (100g)', category: 'Spices', price: 45, stock: 180, lowStockThreshold: 35, expiryDate: '2025-10-01', barcode: '990000000077' },
        { id: 'kg-prod-78', name: 'Everest Garam Masala (100g)', category: 'Spices', price: 75, stock: 150, lowStockThreshold: 30, expiryDate: '2025-09-15', barcode: '990000000078' },
        { id: 'kg-prod-79', name: 'Tata Sampann Coriander Powder (200g)', category: 'Spices', price: 60, stock: 160, lowStockThreshold: 30, expiryDate: '2025-08-20', barcode: '990000000079' },
        { id: 'kg-prod-80', name: 'MDH Chana Masala (100g)', category: 'Spices', price: 70, stock: 120, lowStockThreshold: 25, expiryDate: '2025-07-25', barcode: '990000000080' },
        { id: 'kg-prod-81', name: 'Catch Jeera Powder (100g)', category: 'Spices', price: 65, stock: 130, lowStockThreshold: 25, expiryDate: '2025-11-01', barcode: '990000000081' },
        { id: 'kg-prod-82', name: 'Aachi Chicken Masala (50g)', category: 'Spices', price: 30, stock: 100, lowStockThreshold: 20, expiryDate: '2025-06-10', barcode: '990000000082' },
        { id: 'kg-prod-83', name: 'Whole Black Pepper (50g)', category: 'Spices', price: 90, stock: 80, lowStockThreshold: 15, expiryDate: '2026-03-01', barcode: '990000000083' },
        { id: 'kg-prod-84', name: 'Cumin Seeds (100g)', category: 'Spices', price: 50, stock: 150, lowStockThreshold: 30, expiryDate: '2026-02-01', barcode: '990000000084' },
        { id: 'kg-prod-85', name: 'Cardamom (25g)', category: 'Spices', price: 120, stock: 60, lowStockThreshold: 10, expiryDate: '2026-05-01', barcode: '990000000085' },
        
        // Personal Care (10 items)
        { id: 'kg-prod-86', name: 'Lifebuoy Soap Bar (Pack of 4)', category: 'Personal Care', price: 120, stock: 100, lowStockThreshold: 20, expiryDate: '2026-01-01', barcode: '990000000086' },
        { id: 'kg-prod-87', name: 'Dove Shampoo (180ml)', category: 'Personal Care', price: 199, stock: 80, lowStockThreshold: 15, expiryDate: '2026-04-01', barcode: '990000000087' },
        { id: 'kg-prod-88', name: 'Colgate MaxFresh Toothpaste (150g)', category: 'Personal Care', price: 95, stock: 150, lowStockThreshold: 30, expiryDate: '2026-06-01', barcode: '990000000088' },
        { id: 'kg-prod-89', name: 'Pepsodent Germicheck Toothpaste (150g)', category: 'Personal Care', price: 85, stock: 140, lowStockThreshold: 25, expiryDate: '2026-05-01', barcode: '990000000089' },
        { id: 'kg-prod-90', name: 'Dettol Antiseptic Liquid (250ml)', category: 'Personal Care', price: 150, stock: 90, lowStockThreshold: 18, expiryDate: '2026-07-01', barcode: '990000000090' },
        { id: 'kg-prod-91', name: 'Nivea Body Lotion (400ml)', category: 'Personal Care', price: 350, stock: 70, lowStockThreshold: 10, expiryDate: '2026-08-01', barcode: '990000000091' },
        { id: 'kg-prod-92', name: 'Head & Shoulders Shampoo (180ml)', category: 'Personal Care', price: 180, stock: 75, lowStockThreshold: 15, expiryDate: '2026-03-01', barcode: '990000000092' },
        { id: 'kg-prod-93', name: 'Gillette Mach3 Razor', category: 'Personal Care', price: 130, stock: 60, lowStockThreshold: 10, expiryDate: '2028-01-01', barcode: '990000000093' },
        { id: 'kg-prod-94', name: 'Parachute Coconut Oil (500ml)', category: 'Personal Care', price: 210, stock: 110, lowStockThreshold: 20, expiryDate: '2025-12-01', barcode: '990000000094' },
        { id: 'kg-prod-95', name: 'Pears Pure & Gentle Soap', category: 'Personal Care', price: 45, stock: 200, lowStockThreshold: 40, expiryDate: '2026-02-01', barcode: '990000000095' },
        
        // Household Cleaners (5 items)
        { id: 'kg-prod-96', name: 'Vim Dishwash Liquid (500ml)', category: 'Household', price: 99, stock: 120, lowStockThreshold: 25, expiryDate: '2025-11-01', barcode: '990000000096' },
        { id: 'kg-prod-97', name: 'Surf Excel Detergent Powder (1kg)', category: 'Household', price: 150, stock: 100, lowStockThreshold: 20, expiryDate: '2025-10-01', barcode: '990000000097' },
        { id: 'kg-prod-98', name: 'Lizol Floor Cleaner (975ml)', category: 'Household', price: 180, stock: 90, lowStockThreshold: 18, expiryDate: '2025-09-01', barcode: '990000000098' },
        { id: 'kg-prod-99', name: 'Harpic Toilet Cleaner (500ml)', category: 'Household', price: 90, stock: 130, lowStockThreshold: 25, expiryDate: '2025-12-01', barcode: '990000000099' },
        { id: 'kg-prod-100', name: 'Good Knight Gold Flash Refill', category: 'Household', price: 75, stock: 150, lowStockThreshold: 30, expiryDate: '2026-01-01', barcode: '990000000100' },
    ];
    
    // 2. Generate Sales data for 1 year. The number of transactions is moderated to avoid localStorage quota issues.
    const sales: Sale[] = [];
    const taxRate = 5; // 5%
    const now = new Date();

    for (let day = 365; day >= 0; day--) { // Generate data for the last year
        const date = new Date(now);
        date.setDate(now.getDate() - day);
        
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Moderated transaction volume to prevent quota errors
        const baseTransactions = 3;
        const randomTransactions = Math.floor(Math.random() * 5); // 0-4
        const weekendBonus = isWeekend ? Math.floor(Math.random() * 8) + 2 : 0; // 2-10 on weekends
        const dailyTransactions = baseTransactions + randomTransactions + weekendBonus;

        for (let t = 0; t < dailyTransactions; t++) {
            const numItemsInSale = Math.floor(Math.random() * 4) + 1; // 1 to 4 items per sale
            const items: SaleItem[] = [];
            const productIndexes = new Set<number>();

            for (let i = 0; i < numItemsInSale; i++) {
                let productIndex;
                do {
                    productIndex = Math.floor(Math.random() * products.length);
                } while (productIndexes.has(productIndex));
                productIndexes.add(productIndex);

                const product = products[productIndex];
                const quantity = Math.floor(Math.random() * 3) + 1; // 1 to 3 quantity
                items.push({
                    productId: product.id,
                    name: product.name,
                    quantity: quantity,
                    price: product.price,
                });
            }
            
            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const taxAmount = subtotal * (taxRate / 100);
            const total = subtotal + taxAmount;
            
            // Randomize time of day
            date.setHours(Math.floor(Math.random() * 12) + 9); // 9 AM to 9 PM
            date.setMinutes(Math.floor(Math.random() * 60));

            sales.push({
                id: uuidv4(),
                date: date.toISOString(),
                items,
                subtotal,
                taxAmount,
                total,
                userId
            });
        }
    }
    
    return { products, sales };
};


const useInventory = (userId: string | null): InventoryHook => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueResetTimestamp, setRevenueResetTimestamp] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    };

    try {
      const savedProducts = localStorage.getItem(`products_${userId}`);
      const savedSales = localStorage.getItem(`sales_${userId}`);
      const savedTimestamp = localStorage.getItem(`revenueResetTimestamp_${userId}`);
      
      // SPECIAL CASE FOR KAGGLE USER: Seed data if it doesn't exist
      if (userId === 'user-kaggle' && !savedProducts && !savedSales) {
          const { products: kaggleProducts, sales: kaggleSales } = getKaggleGroceryData(userId);
          setProducts(kaggleProducts);
          setSales(kaggleSales);
      } else {
        // EXISTING LOGIC FOR ALL OTHER USERS
        if (savedProducts) {
          setProducts(JSON.parse(savedProducts));
        } else {
          // Seed initial data only for the primary demo user ('user-1').
          if (userId === 'user-1') {
              setProducts(getInitialProducts());
          } else {
              setProducts([]);
          }
        }

        if (savedSales) {
          setSales(JSON.parse(savedSales));
        } else {
          // Seed initial sales only for the primary demo user ('user-1').
          if (userId === 'user-1') {
              setSales(getInitialSales(userId));
          } else {
              setSales([]);
          }
        }
      }
      
      if (savedTimestamp) {
        setRevenueResetTimestamp(savedTimestamp);
      } else {
        setRevenueResetTimestamp(null);
      }
    } catch (error) {
        console.error("Failed to load inventory from localStorage", error);
        // Fallback to initial state if localStorage is corrupt.
        if (userId === 'user-1') {
            setProducts(getInitialProducts());
            setSales(getInitialSales(userId));
        } else if (userId === 'user-kaggle') {
             const { products: kaggleProducts, sales: kaggleSales } = getKaggleGroceryData(userId);
             setProducts(kaggleProducts);
             setSales(kaggleSales);
        } else {
            setProducts([]);
            setSales([]);
        }
        setRevenueResetTimestamp(null);
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

  const addProduct = (productData: Omit<Product, 'id'>): { success: boolean; error?: string } => {
    const trimmedName = productData.name.trim();
    const trimmedBarcode = productData.barcode.trim();

    if (products.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
        return { success: false, error: 'product_name_exists' };
    }
    if (products.some(p => p.barcode === trimmedBarcode)) {
        return { success: false, error: 'barcode_exists' };
    }

    const newProduct: Product = { ...productData, name: trimmedName, barcode: trimmedBarcode, id: uuidv4() };
    setProducts(prev => [...prev, newProduct]);
    return { success: true };
  };

  const updateProduct = (updatedProduct: Product): { success: boolean; error?: string } => {
    const trimmedName = updatedProduct.name.trim();
    const trimmedBarcode = updatedProduct.barcode.trim();

    if (products.some(p => p.id !== updatedProduct.id && p.name.toLowerCase() === trimmedName.toLowerCase())) {
        return { success: false, error: 'product_name_exists' };
    }
    if (products.some(p => p.id !== updatedProduct.id && p.barcode === trimmedBarcode)) {
        return { success: false, error: 'barcode_exists' };
    }
    
    const finalProduct = { ...updatedProduct, name: trimmedName, barcode: trimmedBarcode };
    setProducts(prev => prev.map(p => p.id === finalProduct.id ? finalProduct : p));
    return { success: true };
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
    
    // Final validation check before processing the sale
    const insufficientStockItems: string[] = [];
    items.forEach(saleItem => {
        const product = products.find(p => p.id === saleItem.productId);
        if (!product || product.stock < saleItem.quantity) {
            insufficientStockItems.push(product?.name || saleItem.name);
        }
    });

    if (insufficientStockItems.length > 0) {
        throw new Error(`Sale cannot be completed. Insufficient stock for: ${insufficientStockItems.join(', ')}`);
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
  
  const resetDashboardRevenue = () => {
    if (userId) {
        const now = new Date().toISOString();
        setRevenueResetTimestamp(now);
        try {
            localStorage.setItem(`revenueResetTimestamp_${userId}`, now);
        } catch (error) {
            console.error("Failed to save revenue reset timestamp", error);
        }
    }
  };
  
  const clearSalesData = () => {
    setSales([]);
    setRevenueResetTimestamp(null);
    if (userId) {
      try {
        localStorage.removeItem(`sales_${userId}`);
        localStorage.removeItem(`revenueResetTimestamp_${userId}`);
      } catch (error) {
        console.error("Failed to clear sales data from localStorage", error);
      }
    }
  };

  return { products, sales, addProduct, updateProduct, deleteProduct, addSale, clearSalesData, resetDashboardRevenue, revenueResetTimestamp };
};

export default useInventory;