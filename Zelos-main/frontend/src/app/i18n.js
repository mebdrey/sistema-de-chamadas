// i18.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './locales/pt/translation.json';
import en from './locales/en/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
    },
    fallbackLng: 'pt',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
