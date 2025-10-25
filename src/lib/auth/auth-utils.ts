// lib/auth-utils.ts (CLIENT-SIDE ONLY)

// Hàm để lưu thông tin user vào cookies (client-side)
export function setAuthCookies(userId: number, tenantId: number) {
  // Lưu userId và tenantId vào cookies
  document.cookie = `userId=${userId}; path=/; max-age=86400; SameSite=Strict`
  document.cookie = `tenantId=${tenantId}; path=/; max-age=86400; SameSite=Strict`
}

// Hàm để xóa cookies (logout)
export function clearAuthCookies() {
  document.cookie = 'userId=; path=/; max-age=0'
  document.cookie = 'tenantId=; path=/; max-age=0'
  document.cookie = 'hasRole=; path=/; max-age=0'
}

// Hàm lấy thông tin user từ cookies (client-side)
export function getAuthFromClientCookies() {
  const userId = document.cookie
    .split('; ')
    .find(row => row.startsWith('userId='))
    ?.split('=')[1]
  
  const tenantId = document.cookie
    .split('; ')
    .find(row => row.startsWith('tenantId='))
    ?.split('=')[1]

  return {
    userId: userId ? parseInt(userId) : null,
    tenantId: tenantId ? parseInt(tenantId) : null,
  }
}