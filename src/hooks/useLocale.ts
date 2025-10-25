'use client'

import { useParams } from 'next/navigation'

export function useLocale() {
  const { locale } = useParams() as { locale: string }
  return locale
}
