'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = window.localStorage.getItem('ducklab_lang');
    if (saved === 'en' || saved === 'es') {
      setLang(saved);
      return;
    }
    const browserLang = window.navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en';
    setLang(browserLang);
  }, []);

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'es' : 'en';
      window.localStorage.setItem('ducklab_lang', next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
