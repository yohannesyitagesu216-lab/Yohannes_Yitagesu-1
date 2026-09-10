import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import am from './locales/am.json'
import om from './locales/om.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'
import es from './locales/es.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      am: { translation: am },
      om: { translation: om },
      fr: { translation: fr },
      ar: { translation: ar },
      es: { translation: es },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'am', 'om', 'fr', 'ar', 'es'],
    detection: {
      order: ['localStorage', 'htmlTag', 'navigator'],
      lookupLocalStorage: 'agro_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
