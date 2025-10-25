import dayjs from 'dayjs';

export function formatVND(amount: number | string): string {
  if (typeof amount === 'string') {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      return 'Giá trị không hợp lệ';
    }
    amount = parsedAmount;
  }
  if (typeof amount !== 'number') {
    return 'Giá trị không hợp lệ';
  }
  return (amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', ' đ');
}

export const formatDate = (date: string | Date | dayjs.Dayjs | null | undefined): string => {
  if (!date) {
    return '-'; // Hoặc một giá trị mặc định khác tùy bạn
  }
  return dayjs(date).format('DD/MM/YYYY HH:mm:ss');
};
