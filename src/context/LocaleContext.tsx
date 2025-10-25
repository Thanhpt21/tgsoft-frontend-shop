// contexts/LocaleContext.tsx
'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import i18n from '@/i18n/i18n';


interface LocaleContextType {
  locale: string | undefined;
  changeLocale: (newLocale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<string | undefined>(undefined);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const pathLocale = pathname.split('/')[1];
    setLocale(pathLocale);
  }, [pathname]);

  const changeLocale = (newLocale: string) => {
    const currentPathLocale = pathname.split('/')[1];
    const newPath = currentPathLocale
      ? pathname.replace(`/${currentPathLocale}`, newLocale === i18n.options.defaultNS ? '' : `/${newLocale}`)
      : (newLocale === i18n.options.defaultNS ? '/vi' : `/${newLocale}`);
    router.push(newPath || '/');
  };

  return (
    <LocaleContext.Provider value={{ locale, changeLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocaleContext = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocaleContext must be used within a LocaleProvider');
  }
  return context;
};