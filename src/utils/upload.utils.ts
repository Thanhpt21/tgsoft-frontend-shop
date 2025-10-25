import { message } from 'antd'
import { Upload } from 'antd'
import type { RcFile } from 'antd/es/upload'


const validateImage = (file: RcFile, maxSizeMB: number = 5) => {
  // Kiểm tra loại file
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('Chỉ chấp nhận file ảnh!')
    return Upload.LIST_IGNORE
  }

  // Kiểm tra kích thước
  const isLtMaxSize = file.size / 1024 / 1024 < maxSizeMB
  if (!isLtMaxSize) {
    message.error(`Ảnh phải nhỏ hơn ${maxSizeMB}MB!`)
    return Upload.LIST_IGNORE
  }

  return false
}

export const createImageUploadValidator = (maxSizeMB: number = 5) => {
  return (file: RcFile) => validateImage(file, maxSizeMB)
}

export const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/jpg,image/webp'
export const MAX_IMAGE_SIZE_MB = 5

