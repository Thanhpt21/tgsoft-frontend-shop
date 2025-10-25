// app/admin/layout.tsx
import AdminLayout from '@/components/admin/layout.admin'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}