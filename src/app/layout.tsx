// src/app/layout.tsx
'use client';

import { ReactNode } from 'react';
import '@/styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppContent from '@/components/layout/AppContent'; // Import component mới

// Khởi tạo QueryClient một lần duy nhất bên ngoài component để tránh khởi tạo lại không cần thiết
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <QueryClientProvider client={queryClient}>
          <AppContent>
            {children}
          </AppContent>
        </QueryClientProvider>
      </body>
    </html>
  );
}