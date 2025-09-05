import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import pt from './locales/pt/translation.json';
import en from './locales/en/translation.json';

i18n
  .use(LanguageDetector) // Detecta idioma do navegador
  .use(initReactI18next) // Passa i18n para o react-i18next
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
    },
    fallbackLng: 'pt',   // Idioma padrão
    interpolation: {
      escapeValue: false, // React já protege contra XSS
    },
  });

export default i18n;
