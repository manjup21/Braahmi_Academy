import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import kn from './locales/kn.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import ml from './locales/ml.json';
import { defaultLanguage, languageStorageKey, languages } from './languages';

const supportedCodes = languages.map((lang) => lang.code);

function getInitialLanguage() {
  if (typeof window === 'undefined') return defaultLanguage;
  const stored = localStorage.getItem(languageStorageKey);
  if (stored && supportedCodes.includes(stored)) return stored;
  const browser = navigator.language?.split('-')[0];
  if (browser && supportedCodes.includes(browser)) return browser;
  return defaultLanguage;
}

const initialLanguage = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    kn: { translation: kn },
    ta: { translation: ta },
    te: { translation: te },
    ml: { translation: ml },
  },
  lng: initialLanguage,
  fallbackLng: defaultLanguage,
  supportedLngs: supportedCodes,
  interpolation: {
    escapeValue: false,
  },
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(languageStorageKey, lng);
  }
});

export default i18n;
