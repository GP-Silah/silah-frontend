import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {};

const modules = import.meta.glob('./locales/*/*.json', {
  eager: true,
  as: 'raw',
});

for (const path in modules) {
  // path example: ./locales/en/landing.json
  const [, lang, ns] = path.match(/\.\/locales\/(\w+)\/(.+)\.json/) || [];
  if (!resources[lang]) resources[lang] = {};
  resources[lang][ns] = JSON.parse(modules[path]);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
