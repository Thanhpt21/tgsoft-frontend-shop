export interface BlogCategory {
  id: number
  title: string
  slug: string
  image?: string | null
  createdAt: string // hoặc Date nếu bạn xử lý kiểu ngày trong client
  updatedAt: string
}
