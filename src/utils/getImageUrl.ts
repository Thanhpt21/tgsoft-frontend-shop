export const getImageUrl = (thumb: string | null): string | null => {
  if (!thumb) return null;

  // Nếu đã là URL đầy đủ, trả về luôn
  if (thumb.startsWith('http://') || thumb.startsWith('https://')) {
    return thumb;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Xóa dấu / ở cuối baseUrl và đầu thumb, rồi nối với 1 dấu /
  const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Xóa / cuối
  const cleanThumb = thumb.replace(/^\//, ''); // Xóa / đầu

  return `${cleanBaseUrl}/${cleanThumb}`;
};