// src/i18n/i18n.ts
'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string, namespace: string) =>
      import(`./locales/${language}/${namespace}.json`)
    )
  )
  .init({
    fallbackLng: 'vi',
    supportedLngs: ['en', 'vi'],
    ns: ['common', 'about_us', 'products', 'product_detail', 'cart', 'checkout', 'account', 'blog', 'contact', 'wishlist'],
    defaultNS: 'common',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;