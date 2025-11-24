import { SupportStatus } from "@/enums/support-mailbox.enums"


export const getStatusLabel = (status: SupportStatus): string => {
  const labels = {
    [SupportStatus.PENDING]: 'Đang chờ',
    [SupportStatus.IN_PROGRESS]: 'Đang xử lý',
    [SupportStatus.RESOLVED]: 'Đã giải quyết',
    [SupportStatus.CLOSED]: 'Đã đóng',
    [SupportStatus.CANCELLED]: 'Đã hủy',
  }
  return labels[status] || status
}

export const getStatusColor = (status: SupportStatus): string => {
  const colors = {
    [SupportStatus.PENDING]: 'orange',
    [SupportStatus.IN_PROGRESS]: 'blue',
    [SupportStatus.RESOLVED]: 'green',
    [SupportStatus.CLOSED]: 'gray',
    [SupportStatus.CANCELLED]: 'red',
  }
  return colors[status] || 'default'
}