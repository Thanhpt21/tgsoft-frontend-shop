// app/(auth)/register/page.tsx
'use client'

import { useRegister } from '@/hooks/auth/useRegister'

import { Form, Input, Button, Card, message } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const { mutate: registerUser, isPending } = useRegister();
  const router = useRouter();

  const [form] = Form.useForm();

  const onSubmit = async (values: any) => {
    const { name, email, password } = values;

    registerUser({ name, email, password }, {
      onSuccess: () => {
        message.success('Đăng ký thành công!');
        router.push('/login');
      },
      onError: (error) => {
        message.error(error.message || 'Đăng ký thất bại!');
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
          <h2 className="text-center text-3xl font-bold mb-4">Đăng ký</h2>
          <p className="text-center text-base text-muted-foreground mb-6">
            Điền thông tin của bạn để tạo tài khoản
          </p>

          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            className="space-y-4"
          >
            <Form.Item
              name="name"
              label="Tên của bạn"
              rules={[
                { required: true, message: 'Tên không được để trống' },
                { min: 2, message: 'Tên ít nhất 2 ký tự' },
              ]}
            >
              <Input
                placeholder="Nhập tên của bạn"
                className="rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>

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
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Xác nhận mật khẩu không được để trống' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu và xác nhận mật khẩu không khớp'));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="••••••"
                className="rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 rounded-md py-2 h-auto text-lg"
              >
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <div className="text-sm text-center text-muted-foreground mt-4">
            Đã có tài khoản?{' '}
            <Link href="/login" className="underline hover:text-blue-600 text-blue-500 transition-colors duration-200">
              Đăng nhập ngay
            </Link>
          </div>
        </Card>

       
      </motion.div>
    </div>
  );
}