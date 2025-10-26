import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TranslationContextType {
  language: string;
  t: (key: string) => string;
  changeLanguage: (lang: string) => void;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [translations, setTranslations] = useState<{[key: string]: any} | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
        try {
            const [enRes, hiRes, knRes] = await Promise.all([
                fetch('../locales/en.json'),
                fetch('../locales/hi.json'),
                fetch('../locales/kn.json'),
            ]);
            if (!enRes.ok || !hiRes.ok || !knRes.ok) {
                throw new Error('Failed to fetch translation files');
            }
            const enData = await enRes.json();
            const hiData = await hiRes.json();
            const knData = await knRes.json();
            setTranslations({ en: enData, hi: hiData, kn: knData });
        } catch (error) {
            console.error("Failed to load translation files", error);
            // Fallback to empty to prevent app crash
            setTranslations({ en: {}, hi: {}, kn: {} });
        }
    };
    loadTranslations();
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const changeLanguage = (lang: string) => {
    if (translations && translations[lang]) {
      setLanguage(lang);
    }
  };

  const t = (key: string): string => {
    if (!translations) return key;

    const keys = key.split('.');
    let result = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation not found
        let fallbackResult = translations['en'];
        for (const fk of keys) {
             fallbackResult = fallbackResult?.[fk];
        }
        return fallbackResult || key;
      }
    }
    return result || key;
  };

  const value = { language, t, changeLanguage };
  
  if (!translations) {
      return null; // Don't render children until translations are loaded
  }

  return React.createElement(
    TranslationContext.Provider,
    { value },
    children
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};