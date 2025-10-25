'use client';

import { useTranslation as useTranslationOrg } from 'react-i18next';
import { useParams } from 'next/navigation';
import { Language, languages } from './settings';

export function useTranslation(ns?: string) {
  const params = useParams();
  const locale =
    typeof params?.locale === 'string' && languages.includes(params.locale as Language)
      ? (params.locale as Language)
      : 'vi';

  return useTranslationOrg(ns, { lng: locale });
}
