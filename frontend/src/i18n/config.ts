import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from './locales/en.json'
import zhTWTranslations from './locales/zh-TW.json'

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslations
            },
            'zh-TW': {
                translation: zhTWTranslations
            }
        },
        lng: localStorage.getItem('language') || 'en', // Default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // React already escapes values
        }
    })

export default i18n

