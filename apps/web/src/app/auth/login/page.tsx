'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wallet, LogIn, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api-client';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const res = await api.post<{ user: any; accessToken: string }>('/auth/login', data);
      setAuth(res.user, res.accessToken);
      toast.success('Đăng nhập thành công');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--gradient-hero)'
    }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: 440, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'var(--gradient-purple)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <Wallet size={24} color="white" />
          </div>
          <h2>Chào mừng trở lại!</h2>
          <p style={{ marginTop: 8 }}>Đăng nhập vào FinWallet để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-col gap-4">
          <div className="form-group">
            <label className="label"><Mail size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}/> Email</label>
            <input 
              type="email" 
              className={`input ${errors.email ? 'border-rose' : ''}`} 
              placeholder="user@example.com"
              {...register('email')}
            />
            {errors.email && <span style={{ fontSize: '0.75rem', color: 'var(--color-rose)' }}>{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="label"><Lock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}/> Mật khẩu</label>
              <Link href="/auth/forgot-password" style={{ fontSize: '0.75rem' }}>Quên mật khẩu?</Link>
            </div>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && <span style={{ fontSize: '0.75rem', color: 'var(--color-rose)' }}>{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: 12 }} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : <><LogIn size={18} /> Đăng nhập</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Chưa có tài khoản? <Link href="/auth/register" style={{ fontWeight: 600 }}>Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
