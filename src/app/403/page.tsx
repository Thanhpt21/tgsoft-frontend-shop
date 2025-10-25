'use client';

import { Result, Button, Typography, Space, Card } from 'antd';
import { useRouter } from 'next/navigation';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Paragraph, Text, Link } = Typography;

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        padding: 24,
      }}
    >
      <Card
        style={{
          maxWidth: 500,
          width: '100%',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Result
          status="403"
          title={<Text strong style={{ fontSize: 24 }}>Truy cập bị từ chối</Text>}
          subTitle={
            <Paragraph type="secondary">
              Bạn không có quyền truy cập vào trang này.  
              Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
            </Paragraph>
          }
          extra={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                block
                onClick={() => router.back()}
              >
                Quay lại
              </Button>
              <Paragraph type="secondary" style={{ marginTop: 16, textAlign: 'center' }}>
                Nếu bạn cần quyền truy cập, vui lòng liên hệ:
                <br />
                <Link
                  href="mailto:admin@yourdomain.com"
                  style={{ color: '#1677ff', fontWeight: 500 }}
                >
                  <MailOutlined /> admin@yourdomain.com
                </Link>
              </Paragraph>
            </Space>
          }
        />
      </Card>
    </div>
  );
}
