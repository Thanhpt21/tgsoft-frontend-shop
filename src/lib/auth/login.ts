import axios from 'axios'
import { LoginResponse } from '@/types/user.type'
import { setCookie } from 'cookies-next'

export interface LoginBody {
  email: string
  password: string
}

export const login = async (body: LoginBody): Promise<LoginResponse> => {
  try {
    const res = await axios.post<LoginResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      body,
      {
        withCredentials: true,
        headers: {
          'x-tenant-id': process.env.NEXT_PUBLIC_TENANT_ID || '1',
        },
      }
    )

    const data = res.data

    if (typeof window !== 'undefined' && data.access_token) {
      localStorage.setItem('access_token', data.access_token)
      setCookie('access_token', data.access_token)
    }

    return data
  } catch (error: any) {
    if (error.response) throw error
    throw new Error('Không thể kết nối đến máy chủ')
  }
}
