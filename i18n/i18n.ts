import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './messages/en.json';
import es from './messages/es.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

// Find device preferred language code (e.g., 'en-US' becomes 'en')
const systemLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: systemLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safeguards against XSS injections
    },
  });

export default i18n;
