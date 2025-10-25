import { languages } from './settings';

export function getOptions(lang = 'vi', ns: string[] = ['common']) {
  return {
    supportedLngs: languages,
    fallbackLng: 'vi',
    lng: lang,
    ns,
    defaultNS: 'common',
    returnNull: false,
  };
}

export function getDirection(lang: string) {
  return lang === 'ar' ? 'rtl' : 'ltr';
}
