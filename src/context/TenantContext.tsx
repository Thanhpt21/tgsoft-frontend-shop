// src/contexts/TenantContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Dùng useSearchParams để lấy query params

interface TenantContextType {
  tenantId: string | null;
  setTenantId: (id: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const searchParams = useSearchParams(); // Dùng useSearchParams để lấy query params

  // Cách cũ dùng searchParams
  useEffect(() => {
    const tenant = searchParams.get('x-tenant-id'); // Lấy giá trị từ query string
    if (tenant) {
      setTenantId(tenant);
    }
  }, [searchParams]); // Khi searchParams thay đổi thì set lại tenantId

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
