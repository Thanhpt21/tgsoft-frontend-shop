// app/(auth)/google/callback/page.tsx
'use client'

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, message } from 'antd';

export default function GoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    message.success('Đăng nhập với Google thành công!');

    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="shadow-xl rounded-2xl p-6 md:p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Đang xử lý đăng nhập Google...</h2>
        <p className="text-muted-foreground">Vui lòng chờ trong giây lát.</p>
      </Card>
    </div>
  );
}