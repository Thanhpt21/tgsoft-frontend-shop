// utils/getImageUrl.ts
export const getImageUrl = (thumb: string | null | undefined): string => {
  if (!thumb) return '/placeholder.jpg'; // fallback

  if (thumb.startsWith('http://') || thumb.startsWith('https://')) {
    return thumb;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanThumb = thumb.replace(/^\//, '');

  return `${cleanBaseUrl}/${cleanThumb}` || '/placeholder.jpg';
};