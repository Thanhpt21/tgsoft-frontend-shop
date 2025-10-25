export const logout = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include', // 👈 cần để gửi cookie đi cho backend xóa
  });

  if (!res.ok) {
    throw new Error('Logout thất bại');
  }

  return res.json();
};
