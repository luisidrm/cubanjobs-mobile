import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './messages/en.json';
import es from './messages/es.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

const LANGUAGE_STORAGE_KEY = 'cubanjobs:language';

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

// Apply a previously-chosen language once AsyncStorage resolves, overriding
// the device-locale default above. A brief flash of the default locale on
// cold start is acceptable for MVP scope.
// Guarded on `window` because the web build also goes through this module
// during server-side rendering (Expo Router's web server render pass runs in
// Node, where `window` doesn't exist yet) — AsyncStorage's web backend reads
// `window.localStorage` and throws there. Native and browser runtimes both
// define `window`, so this only skips the SSR pass.
if (typeof window !== 'undefined') {
  AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((stored) => {
    if (stored && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    }
  });
}

/** Changes the active language and persists the choice for future launches. */
export async function setLanguage(lang: 'en' | 'es'): Promise<void> {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

export default i18n;
