export const getImageUrl = (thumb: string | null): string | null => {
  if (!thumb) return null;

  if (thumb.startsWith('http')) return thumb;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Sử dụng `replace` để đảm bảo chỉ có một dấu gạch chéo giữa baseUrl và thumb
  return `${baseUrl.replace(/\/$/, '')}${thumb.startsWith('/') ? thumb : `/${thumb}`}`;
}
