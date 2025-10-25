// app/(auth)/forgot-password/page.tsx
'use client'

import { Form, Input, Button, Card, message } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForgotPassword } from '@/hooks/auth/useForgotPassword'

// Định nghĩa kiểu dữ liệu cho form values
interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword();
  const router = useRouter();
  const [form] = Form.useForm<ForgotPasswordFormValues>();

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotPasswordMutation.mutate(values, {
      onSuccess: () => {
        message.success('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn!');
      },
      onError: (error) => {
        // Thay t() bằng chuỗi tiếng Việt cố định
        message.error(error.message || 'Không thể gửi yêu cầu đặt lại mật khẩu.');
      },
    });
  };

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
            <h1 className="text-3xl font-bold">Quên mật khẩu?</h1> 
            <p className="text-muted-foreground text-base mt-2">
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu
            </p> 
          </div>

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
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={forgotPasswordMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 rounded-md py-2 h-auto text-lg"
              >
                Gửi liên kết đặt lại 
              </Button>
            </Form.Item>
          </Form>

          <div className="text-sm text-center text-muted-foreground mt-4">
            <Link href="/login" className="underline hover:text-blue-600 text-blue-500">
              ← Quay lại Đăng nhập
            </Link> 
          </div>
        </Card>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-blue-500 underline hover:text-blue-600 transition-colors duration-150"
          >
            ← Quay về trang chủ 
          </Link>
        </div>
      </motion.div>
    </div>
  );
}