import axios from 'axios'
import { LoginResponse } from '@/types/user.type'

export interface LoginBody {
  email: string
  password: string
}

export const login = async (body: LoginBody): Promise<LoginResponse> => {
  try {
    let aiToken = null

    // Gọi AI service trước
    try {
      const resAi = await axios.post<LoginResponse>(
        `${process.env.NEXT_PUBLIC_AI_URL}/auth/login`,
        body
      )

      const dataAi = resAi.data
      if (typeof window !== 'undefined' && dataAi.access_token) {
        localStorage.setItem('access_token_ai', dataAi.access_token)
      }
      aiToken = dataAi.access_token

      console.log('Đăng nhập AI thành công')
    } catch (err: any) {
      console.error('Đăng nhập AI thất bại', err.response?.data || err.message)
    }

    // Gọi main service login
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
    const token_login = res.data.access_token

    // Nếu có AI token và login thành công, gọi API update user
    if (aiToken) {
      try {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${data.user.id}`,
          { token: aiToken },
          {
            headers: {
              'Authorization': `Bearer ${token_login}`,
              'x-tenant-id': process.env.NEXT_PUBLIC_TENANT_ID || '1',
            },
          }
        )
        console.log('✅ Đã cập nhật AI token vào user')
      } catch (updateError: any) {
        console.error('❌ Lỗi cập nhật token:', updateError.response?.data || updateError.message)
      }
    }

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