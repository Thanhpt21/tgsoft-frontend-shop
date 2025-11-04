// app/(auth)/login/page.tsx
'use client'

import { useLogin } from '@/hooks/auth/useLogin'
import { useTenantOne } from '@/hooks/tenant/useTenantOne'
import { Form, Input, Button, Card, message, Alert, Spin } from 'antd'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'


interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const loginMutation = useLogin();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form] = Form.useForm<LoginFormValues>();

  // ✅ Lấy tenantId từ env
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;


  // ✅ Fetch thông tin tenant
  const { data: tenant, isLoading: isTenantLoading, isError } = useTenantOne(tenantId!);

  // ✅ Lấy redirect URL từ query params
  const redirectUrl = searchParams.get('redirect') || searchParams.get('returnUrl');

  const onSubmit = (values: LoginFormValues) => {
    // ✅ Kiểm tra tenantId
    if (!tenantId) {
      message.error('Không tìm thấy thông tin cửa hàng. Vui lòng thử lại!');
      return;
    }

    // ✅ Kiểm tra tenant có active không
    if (tenant && !tenant.isActive) {
      message.error('Cửa hàng đang tạm khóa. Vui lòng liên hệ quản trị.');
      return;
    }

    loginMutation.mutate(values, {
      onSuccess: (data) => {
        setTimeout(() => {
          if (redirectUrl) {
            router.push(decodeURIComponent(redirectUrl));
          } else {
            router.push('/');
          }
        }, 300);
      },
    });
  };

  // ✅ Hiển thị loading khi đang fetch tenant
  if (isTenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Spin size="large" tip="Đang tải thông tin cửa hàng..." />
      </div>
    );
  }

  // ✅ Hiển thị lỗi nếu không load được tenant
  if (isError || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <Card className="max-w-md w-full">
          <Alert
            message="Lỗi"
            description="Không thể tải thông tin cửa hàng. Vui lòng thử lại sau."
            type="error"
            showIcon
          />
        </Card>
      </div>
    );
  }

  // ✅ Kiểm tra tenant có active không
  const isTenantActive = tenant.isActive;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6"
      >
        <Card className="shadow-xl border rounded-2xl p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Đăng nhập vào cửa hàng</h1>
            <p className="text-sm text-muted-foreground mt-2">{tenant.name}</p>
          </div>

          {/* ✅ Hiển thị thông báo nếu có redirect URL */}
          {redirectUrl && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 text-center">
              💡 Đăng nhập để tiếp tục
            </div>
          )}

          {/* ⚠️ Cảnh báo nếu cửa hàng bị khóa */}
          {!isTenantActive && (
            <Alert
              message="Cửa hàng đang tạm khóa"
              description="Vui lòng liên hệ quản trị để được hỗ trợ."
              type="warning"
              showIcon
              className="mb-4"
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            className="space-y-4"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Email không được để trống' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input
                type="email"
                placeholder="you@example.com"
                className="rounded-md focus:border-blue-500 focus:ring-blue-500"
                disabled={!isTenantActive}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Mật khẩu không được để trống' },
                { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
              ]}
            >
              <Input.Password
                placeholder="••••••"
                className="rounded-md focus:border-blue-500 focus:ring-blue-500"
                disabled={!isTenantActive}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loginMutation.isPending}
                disabled={!isTenantActive} // ✅ Disable nếu tenant bị khóa
                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 rounded-md py-2 h-auto text-lg"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
          
          <div className="text-sm text-center text-muted-foreground mt-4">
            <Link 
              href={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="underline hover:text-blue-600 text-blue-500 ml-2"
            >
              Đăng ký
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}