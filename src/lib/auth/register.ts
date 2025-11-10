import axios from 'axios'

export interface RegisterBody {
  name: string
  email: string
  password: string
}

export const register = async (body: RegisterBody) => {
  try {
    try {
      const resAi = await axios.post(`${process.env.NEXT_PUBLIC_AI_URL}/auth/register`, body)
      console.log('Tài khoản AI tạo thành công:', resAi.data)
    } catch (err: any) {
      console.error('Đăng ký tài khoản AI thất bại', err.response?.data || err.message)
    }


    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      body,
      {
        withCredentials: true, // 🔥 BẮT BUỘC để browser lưu cookie (JWT)
        headers: {
          'x-tenant-id': process.env.NEXT_PUBLIC_TENANT_ID || '1', // ✅ đảm bảo luôn có giá trị
        },
      }
    )
    return res.data
  } catch (error: any) {
    if (error.response) {
      throw error // ✅ giữ nguyên thông tin lỗi backend
    }
    throw new Error('Không thể kết nối đến máy chủ')
  }
}