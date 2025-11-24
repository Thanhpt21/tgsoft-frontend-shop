'use client'

import { Modal, Descriptions, Tag, Image, Divider, Typography, Space, Button, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { SupportMailbox } from '@/types/support-mailbox.types'
import { getStatusLabel, getStatusColor } from './support-mailbox.utils'
import { SupportStatus } from '@/enums/support-mailbox.enums'

const { Text, Title } = Typography

interface SupportMailboxDetailModalProps {
  open: boolean
  onClose: () => void
  ticket: SupportMailbox | null
}

export const SupportMailboxDetailModal = ({ open, onClose, ticket }: SupportMailboxDetailModalProps) => {
  if (!ticket) return null

  // Hàm tải về ảnh
  const downloadImage = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      message.success(`Đã tải ảnh: ${fileName}`)
    } catch (error) {
      message.error('Lỗi khi tải ảnh')
    }
  }

  return (
    <Modal 
      title="Chi tiết yêu cầu hỗ trợ" 
      open={open} 
      onCancel={onClose} 
      footer={null} 
      width={700}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Thông tin cơ bản */}
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Tiêu đề">
            <Text strong>{ticket.title}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="Mô tả chi tiết">
            <Text>{ticket.description || 'Không có mô tả'}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="Trạng thái">
            <Tag color={getStatusColor(ticket.status)}>
              {getStatusLabel(ticket.status)}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Người tạo">
            <div>
              <div><Text strong>{ticket.creator?.name}</Text></div>
              <div><Text type="secondary">{ticket.creator?.email}</Text></div>
            </div>
          </Descriptions.Item>
          
          <Descriptions.Item label="Ngày tạo">
            {new Date(ticket.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
          
          <Descriptions.Item label="Cập nhật lần cuối">
            {new Date(ticket.updatedAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
        </Descriptions>

        {/* Phản hồi từ Shop */}
        {ticket.shopReply && (
          <>
            <Divider orientation="left">Phản hồi từ Shop</Divider>
            <div className="bg-blue-50 p-4 rounded border">
              <Text>{ticket.shopReply}</Text>
              {ticket.shopRepliedAt && (
                <div className="text-xs text-gray-500 mt-2">
                  Phản hồi lúc: {new Date(ticket.shopRepliedAt).toLocaleString('vi-VN')}
                </div>
              )}
            </div>
          </>
        )}

        {/* Phản hồi từ Admin */}
        {ticket.adminReply && (
          <>
            <Divider orientation="left">Phản hồi từ Admin</Divider>
            <div className="bg-green-50 p-4 rounded border">
              <Text>{ticket.adminReply}</Text>
              <div className="text-xs text-gray-500 mt-2">
                Phản hồi bởi: <Text strong>{ticket.replier?.name}</Text> ({ticket.replier?.email})
              </div>
              {ticket.repliedAt && (
                <div className="text-xs text-gray-500">
                  Phản hồi lúc: {new Date(ticket.repliedAt).toLocaleString('vi-VN')}
                </div>
              )}
            </div>
          </>
        )}

        {/* Hình ảnh đính kèm */}
        {ticket.images && ticket.images.files && ticket.images.files.length > 0 && (
          <>
            <Divider orientation="left">Hình ảnh đính kèm</Divider>
            <div className="flex flex-wrap gap-2">
              {ticket.images.files.map((file: any, index: number) => (
                <div key={index} className="border rounded p-2 relative group">
                  <Image
                    src={file.url}
                    alt={file.name}
                    width={100}
                    height={100}
                    className="object-cover rounded cursor-pointer"
                    preview={{
                      mask: (
                        <div className="flex items-center gap-1">
                          <span>Xem ảnh</span>
                          <Button
                            type="text"
                            icon={<DownloadOutlined />}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              downloadImage(file.url, file.name)
                            }}
                          />
                        </div>
                      ),
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-1 truncate max-w-[100px]">
                    {file.name}
                  </div>
                  {/* Nút download nhỏ trên ảnh thumbnail */}
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    size="small"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => downloadImage(file.url, file.name)}
                  />
                </div>
              ))}
            </div>
            
            {/* Nút download tất cả ảnh */}
            <div className="flex justify-end mt-2">
              <Button
                type="dashed"
                icon={<DownloadOutlined />}
                onClick={() => {
                  ticket.images.files.forEach((file: any, index: number) => {
                    setTimeout(() => {
                      downloadImage(file.url, file.name)
                    }, index * 500)
                  })
                  message.info('Đang tải xuống tất cả ảnh...')
                }}
              >
                Tải tất cả ảnh
              </Button>
            </div>
          </>
        )}

        {/* Timeline trạng thái */}
        <Divider orientation="left">Lịch sử trạng thái</Divider>
        <Space direction="vertical" className="w-full">
          <div className="flex justify-between items-center text-sm">
            <span>🟡 {getStatusLabel(SupportStatus.PENDING)}</span>
            <span className="text-gray-500">
              {new Date(ticket.createdAt).toLocaleString('vi-VN')}
            </span>
          </div>
          
          {ticket.status !== SupportStatus.PENDING && (
            <div className="flex justify-between items-center text-sm">
              <span>🔵 {getStatusLabel(ticket.status)}</span>
              <span className="text-gray-500">
                {ticket.updatedAt && new Date(ticket.updatedAt).toLocaleString('vi-VN')}
              </span>
            </div>
          )}
        </Space>
      </div>
    </Modal>
  )
}