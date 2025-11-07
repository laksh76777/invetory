import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | null>(null);

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(() => {
    try {
      // Use a more specific key to avoid conflicts
      return localStorage.getItem('samagra360_gemini_api_key');
    } catch (e) {
      console.error("Failed to read API key from localStorage", e);
      return null;
    }
  });

  const setApiKey = (key: string | null) => {
    setApiKeyState(key);
    try {
        if (key) {
            localStorage.setItem('samagra360_gemini_api_key', key);
        } else {
            localStorage.removeItem('samagra360_gemini_api_key');
        }
    } catch (e) {
        console.error("Failed to save API key to localStorage", e);
    }
  };
  
  const value = { apiKey, setApiKey };

  return React.createElement(ApiKeyContext.Provider, { value }, children);
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};
