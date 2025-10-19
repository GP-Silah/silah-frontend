// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonEn from './locales/en/common.json?raw';
import commonAr from './locales/ar/common.json?raw';
import landingEn from './locales/en/landing.json?raw';
import landingAr from './locales/ar/landing.json?raw';
import headerEn from './locales/en/header.json?raw';
import headerAr from './locales/ar/header.json?raw';
import footerEn from './locales/en/footer.json?raw';
import footerAr from './locales/ar/footer.json?raw';
import aboutEn from './locales/en/about.json?raw';
import aboutAr from './locales/ar/about.json?raw';
import termsEn from './locales/en/terms.json?raw';
import termsAr from './locales/ar/terms.json?raw';
import privacyEn from './locales/en/privacy.json?raw';
import privacyAr from './locales/ar/privacy.json?raw';
import signupEn from './locales/en/signup.json?raw';
import signupAr from './locales/ar/signup.json?raw';
import loginEn from './locales/en/login.json?raw';
import loginAr from './locales/ar/login.json?raw';
import sidebarEn from './locales/en/sidebar.json?raw';
import sidebarAr from './locales/ar/sidebar.json?raw';
import bidsEn from './locales/en/bids.json?raw';
import bidsAr from './locales/ar/bids.json?raw';
import bidDetailsEn from './locales/en/bidDetails.json?raw';
import bidDetailsAr from './locales/ar/bidDetails.json?raw';
import bidOfferEn from './locales/en/bidOffer.json?raw';
import bidOfferAr from './locales/ar/bidOffer.json?raw';
import settingsEn from './locales/en/settings.json?raw';
import settingsAr from './locales/ar/settings.json?raw';
import buyerSettingsEn from './locales/en/buyerSettings.json?raw';
import buyerSettingsAr from './locales/ar/buyerSettings.json?raw';
import createBidEn from './locales/en/createBid.json?raw';
import createBidAr from './locales/ar/createBid.json?raw';

import productEn from './locales/en/product.json?raw';
import productAr from './locales/ar/product.json?raw';

import EmailFlowEn from './locales/en/EmailFlow.json?raw';
import EmailFlowAr from './locales/ar/EmailFlow.json?raw';

import serviceEn from './locales/en/service.json?raw';
import serviceAr from './locales/ar/service.json?raw';

const resources = {
  en: {
    common: JSON.parse(commonEn),
    landing: JSON.parse(landingEn),
    header: JSON.parse(headerEn),
    footer: JSON.parse(footerEn),
    about: JSON.parse(aboutEn),
    terms: JSON.parse(termsEn),
    privacy: JSON.parse(privacyEn),
    signup: JSON.parse(signupEn),
    login: JSON.parse(loginEn),
    sidebar: JSON.parse(sidebarEn),
    bids: JSON.parse(bidsEn),
    bidDetails: JSON.parse(bidDetailsEn),
    bidOffer: JSON.parse(bidOfferEn),
    createBid: JSON.parse(createBidEn),

    product: JSON.parse(productEn),

    EmailFlow: JSON.parse(EmailFlowEn),
    settings: JSON.parse(settingsEn),
    buyerSettings: JSON.parse(buyerSettingsEn),
    service: JSON.parse(serviceEn),
    service: JSON.parse(serviceAr),
  },
  ar: {
    common: JSON.parse(commonAr),
    landing: JSON.parse(landingAr),
    header: JSON.parse(headerAr),
    footer: JSON.parse(footerAr),
    about: JSON.parse(aboutAr),
    terms: JSON.parse(termsAr),
    privacy: JSON.parse(privacyAr),
    signup: JSON.parse(signupAr),
    login: JSON.parse(loginAr),
    sidebar: JSON.parse(sidebarAr),
    bids: JSON.parse(bidsAr),
    bidDetails: JSON.parse(bidDetailsAr),
    bidOffer: JSON.parse(bidOfferAr),
    settings: JSON.parse(settingsAr),
    buyerSettings: JSON.parse(buyerSettingsAr),
    createBid: JSON.parse(createBidAr),

    product: JSON.parse(productAr),

    EmailFlow: JSON.parse(EmailFlowAr),
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      // يخلي اللغة تتبع آخر اختيار/المتصفح
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
