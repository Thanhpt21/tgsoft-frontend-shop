'use client'

import { createContext, useContext, useState } from 'react'

interface AdminLayoutContextProps {
  collapsed: boolean
  toggleSidebar: () => void
}

const AdminLayoutContext = createContext<AdminLayoutContextProps | null>(null)

export function AdminLayoutContextProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  const toggleSidebar = () => setCollapsed(!collapsed)

  return (
    <AdminLayoutContext.Provider value={{ collapsed, toggleSidebar }}>
      {children}
    </AdminLayoutContext.Provider>
  )
}

export function useAdminLayoutContext() {
  const ctx = useContext(AdminLayoutContext)
  if (!ctx) throw new Error('useAdminLayoutContext must be used within AdminLayoutContextProvider')
  return ctx
}
