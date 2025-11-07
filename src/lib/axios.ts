import axios from 'axios'
import { getCookie, setCookie, deleteCookie } from 'cookies-next'
import { message } from 'antd'

/** ✅ Lấy tenantId (chỉ dùng từ .env) */
export function getTenantId(): string {
  const envTenant = process.env.NEXT_PUBLIC_TENANT_ID
  if (envTenant) return envTenant

  // fallback nếu env không tồn tại
  console.warn('NEXT_PUBLIC_TENANT_ID chưa được cấu hình, dùng default')
  return 'default'
}

/** ✅ Tạo instance axios chung */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // gửi cookie nếu backend yêu cầu
})

/** ✅ Request interceptor: tự động gắn x-tenant-id + token */
api.interceptors.request.use(
  (config) => {
    const tenantId = getTenantId()

    // 🔥 Lấy token từ localStorage hoặc cookie (ưu tiên localStorage)
    let token: string | undefined
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('access_token') || undefined
    }
    if (!token) {
      token = getCookie('access_token') as string | undefined
    }

    config.headers = config.headers || {}
    config.headers['x-tenant-id'] = tenantId

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // Chỉ set Content-Type nếu không phải FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }

    return config
  },
  (error) => Promise.reject(error)
)

/** ✅ Response interceptor: xử lý lỗi global */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const errorMessage = error.response?.data?.message

    if (typeof window !== 'undefined') {
      switch (status) {
        case 401:
          message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
          deleteCookie('access_token')
          localStorage.removeItem('access_token')
          window.location.href = '/login'
          break

        case 403:
          break

        case 404:
          message.error(errorMessage || 'Không tìm thấy dữ liệu.')
          break

        case 500:
          message.error('Lỗi hệ thống. Vui lòng thử lại sau.')
          break

        default:
          if (errorMessage) message.error(errorMessage)
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      })
    }

    return Promise.reject(error)
  }
)
