"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  translations,
  type Language,
  type TranslationKey,
} from "./translations";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = "tech2c-language";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "pt";
  const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (saved && (saved === "pt" || saved === "en")) {
    return saved;
  }
  const browserLang = navigator.language.split("-")[0];
  return browserLang === "en" ? "en" : "pt";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Usar lazy initialization para obter idioma do localStorage
  const [language, setLanguageState] = useState<Language>(() => 
    getInitialLanguage()
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, language } = useI18n();
  return { t, language };
}
