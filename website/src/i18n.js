import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import translationEN from './translation/en/translation.json';
import translationFR from './translation/fr/translation.json';

// the translations
const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR
  }
};

// const userLang = navigator.language || navigator.userLanguage;

i18n
  .use(detector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    // lng: userLang.substr(0,2),
    fallbackLng: "en", // use en if detected lng is not available

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;