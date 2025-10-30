// @/context/AuthContext.tsx
'use client';

import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { CurrentUser } from '@/lib/auth/current';
import { useCurrent } from '@/hooks/auth/useCurrent';

interface AuthContextType {
  currentUser: CurrentUser | null | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  isAuthenticated: boolean;  // Thêm thuộc tính isAuthenticated
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading, isError, refetch } = useCurrent(); // Dùng hook useCurrent để lấy thông tin người dùng

  // Kiểm tra xem có người dùng không, nếu có thì là đã đăng nhập
  const isAuthenticated = data !== undefined && data !== null;

  return (
    <AuthContext.Provider value={{ currentUser: data, isLoading, isError, refetch, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng context này
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
