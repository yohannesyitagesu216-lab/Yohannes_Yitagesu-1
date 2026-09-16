import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import am from './locales/am.json'
import om from './locales/om.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'
import es from './locales/es.json'

const withLandingPremium = (locale: Record<string, any>) => ({
  ...locale,
  landingPremium: {
    ...en.landingPremium,
    ...(locale.landingPremium ?? {}),
  },
})

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: withLandingPremium(en) },
      am: { translation: withLandingPremium(am) },
      om: { translation: withLandingPremium(om) },
      fr: { translation: withLandingPremium(fr) },
      ar: { translation: withLandingPremium(ar) },
      es: { translation: withLandingPremium(es) },
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
