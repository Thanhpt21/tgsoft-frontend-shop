import axios from 'axios'
import { LoginResponse } from '@/types/user.type'

export interface LoginBody {
  email: string
  password: string
}

export const login = async (body: LoginBody): Promise<LoginResponse> => {
  try {
    // Chỉ gọi main service login
    const res = await axios.post<LoginResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      body,
      {
        withCredentials: true,
        headers: {
          'x-tenant-id': process.env.NEXT_PUBLIC_TENANT_ID || '1',
          'Content-Type': 'application/json',
        },
      }
    )

    const data = res.data

    if (typeof window !== 'undefined') {
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
      }
      if (data.user && data.user.id) {
        localStorage.setItem('userId', data.user.id.toString())
      }
    }

    return data
  } catch (error: any) {
    if (error.response) throw error
    throw new Error('Không thể kết nối đến máy chủ')
  }
}