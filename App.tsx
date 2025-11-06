import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import useInventory from './hooks/useInventory';
import type { View, SaleItem } from './types';

import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import PointOfSale from './components/PointOfSale';
import Reports from './components/Reports';
import Settings from './components/Settings';
import AiChatbot from './components/AiChatbot';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const { currentUser } = useAuth();
  const inventory = useInventory(currentUser?.id || null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showRevenueCard, setShowRevenueCard] = useState<boolean>(() => {
    const saved = localStorage.getItem('showRevenueCard');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showAiSuggestionBox, setShowAiSuggestionBox] = useState<boolean>(() => {
    const saved = localStorage.getItem('showAiSuggestionBox');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // --- POS State Lifted Up ---
  const [posCart, setPosCart] = useState<SaleItem[]>([]);
  const [posDiscount, setPosDiscount] = useState('');
  const [posDiscountType, setPosDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  
  const clearPosCart = () => {
      setPosCart([]);
      setPosDiscount('');
      setPosDiscountType('fixed');
  };
  // --- End of Lifted State ---

  const toggleRevenueCard = () => {
    setShowRevenueCard(prev => {
        const newState = !prev;
        localStorage.setItem('showRevenueCard', JSON.stringify(newState));
        return newState;
    });
  };

  const toggleAiSuggestionBox = () => {
    setShowAiSuggestionBox(prev => {
        const newState = !prev;
        localStorage.setItem('showAiSuggestionBox', JSON.stringify(newState));
        return newState;
    });
  };

  if (!currentUser) {
    return isLoginView
      ? <LoginPage onSwitchToSignUp={() => setIsLoginView(false)} />
      : <SignUpPage onSwitchToLogin={() => setIsLoginView(true)} />;
  }
  
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard {...inventory} showRevenueCard={showRevenueCard} showAiSuggestionBox={showAiSuggestionBox} />;
      case 'products':
        return <Products {...inventory} />;
      case 'pos':
        return <PointOfSale 
                  {...inventory} 
                  currentUser={currentUser}
                  cart={posCart}
                  setCart={setPosCart}
                  discount={posDiscount}
                  setDiscount={setPosDiscount}
                  discountType={posDiscountType}
                  setDiscountType={setPosDiscountType}
                  clearCart={clearPosCart}
                />;
      case 'reports':
        return <Reports {...inventory} />;
      case 'ai_chatbot':
        return <AiChatbot {...inventory} />;
      case 'settings':
        return <Settings 
                    showRevenueCard={showRevenueCard} 
                    onToggleRevenueCard={toggleRevenueCard} 
                    clearSalesData={inventory.clearSalesData}
                    showAiSuggestionBox={showAiSuggestionBox}
                    onToggleAiSuggestionBox={toggleAiSuggestionBox}
                />;
      default:
        return <Dashboard {...inventory} showRevenueCard={showRevenueCard} showAiSuggestionBox={showAiSuggestionBox} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans">
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;