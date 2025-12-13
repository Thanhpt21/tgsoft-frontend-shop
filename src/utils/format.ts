// utils/format.ts
export const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

export const formatViewCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

export const getReadingTime = (content: any[]) => {
  const wordCount = content.reduce((total, item) => {
    if (item.body) {
      const text = item.body.replace(/<[^>]*>/g, '');
      return total + text.split(/\s+/).length;
    }
    return total;
  }, 0);
  
  const readingTime = Math.ceil(wordCount / 200);
  return Math.max(1, readingTime);
};