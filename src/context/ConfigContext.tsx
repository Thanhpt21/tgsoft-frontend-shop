// contexts/ConfigContext.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useConfigOne } from '@/hooks/config/useConfigOne';  // Import hook để lấy cấu hình
import { Spin, message } from 'antd';
import { Config } from '@/types/config.type';


interface ConfigContextType {
  config: Config | null;
  isLoading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
  configId: number | string; // ID cấu hình để tải dữ liệu
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children, configId }) => {
  const { data, isLoading, error } = useConfigOne(configId);

  // Xử lý thông báo lỗi nếu có
  if (error) {
    message.error('Lỗi tải cấu hình');
  }

  return (
    <ConfigContext.Provider value={{ config: data, isLoading, error: error?.message || null }}>
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Spin size="large" />
        </div>
      ) : (
        children
      )}
    </ConfigContext.Provider>
  );
};

export const useConfigContext = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfigContext must be used within a ConfigProvider');
  }
  return context;
};
