export const getImageUrl = (thumb: string | null | undefined): string | null => {
  if (!thumb || thumb.trim() === '') return null;
  if (thumb.startsWith('http://') || thumb.startsWith('https://')) {
    return thumb;
  }
  const cleanThumb = thumb.replace(/^\/+|\/+$/g, '').trim();
  if (!cleanThumb) return null;
  const supabaseUrl = 'https://sbctebgbgexgxyvreono.supabase.co';
  const supabaseBucketName = 'images';
  if (!supabaseUrl) {
    console.warn('SUPABASE_URL not set');
    return null;
  }
  return `${supabaseUrl}/storage/v1/object/public/${supabaseBucketName}/${cleanThumb}`;
};
