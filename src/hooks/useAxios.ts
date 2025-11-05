// src/hooks/useAxios.ts
import { useTenant } from '@/context/TenantContext';
import axios from 'axios';


const useAxios = () => {
  const { tenantId } = useTenant();

  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, // Địa chỉ API của bạn
  });

  // Đảm bảo rằng header x-tenant-id được thêm vào đúng cách
  instance.interceptors.request.use(
    (config) => {
      if (tenantId) {
        config.headers = {
          ...(config.headers || {}),
          'x-tenant-id': tenantId, // Thêm x-tenant-id vào header
        };
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

export default useAxios;
