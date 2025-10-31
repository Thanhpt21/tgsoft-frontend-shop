// src/utils/getImageUrl.ts
export const getImageUrl = (thumb: string | null | undefined): string | null => {
  if (!thumb || thumb.trim() === '') return null;

  // Nếu là full URL → trả về luôn
  if (thumb.startsWith('http://') || thumb.startsWith('https://')) {
    return thumb;
  }

  // Loại bỏ / đầu và cuối thừa
  const cleanThumb = thumb.replace(/^\/+|\/+$/g, '').trim();
  if (!cleanThumb) return null;

  // DÙNG NEXT_PUBLIC_IMAGE_URL CHO ẢNH
  const imageBase = (process.env.NEXT_PUBLIC_IMAGE_URL || '').replace(/\/+$/, '');
  if (!imageBase) {
    console.warn('NEXT_PUBLIC_IMAGE_URL not set');
    return null;
  }

  return `${imageBase}/${cleanThumb}`;
};