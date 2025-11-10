import axios from 'axios'
import { LoginResponse } from '@/types/user.type'
import { setCookie } from 'cookies-next'

export interface LoginBody {
  email: string
  password: string
}

export const login = async (body: LoginBody): Promise<LoginResponse> => {
  try {

    try {
      const resAi = await axios.post<LoginResponse>(
        `${process.env.NEXT_PUBLIC_AI_URL}/auth/login`,
        body
      )

      const dataAi = resAi.data
      if (typeof window !== 'undefined' && dataAi.access_token) {
        localStorage.setItem('access_token_ai', dataAi.access_token)
      }

      console.log('Đăng nhập AI thành công')
    } catch (err: any) {
      console.error('Đăng nhập AI thất bại', err.response?.data || err.message)
    }



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
