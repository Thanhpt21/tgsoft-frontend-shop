'use client'

import { I18nextProvider } from 'react-i18next'
import { useEffect, useState, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import i18n from '@/i18n/i18n'

export default function I18nProvider({
  locale,
  children,
}: {
  locale: string
  children: ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale)
    }
  }, [locale])

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </QueryClientProvider>
  )
}
