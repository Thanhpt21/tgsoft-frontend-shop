'use client'

import { Layout } from 'antd'

export default function FooterAdmin() {
  return (
    <Layout.Footer style={{ textAlign: 'center' }}>
      Admin ©{new Date().getFullYear()} Created by You
    </Layout.Footer>
  )
}
