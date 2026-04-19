'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wallet, UserPlus, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api-client';

const schema = z.object({
  firstName: z.string().min(2, 'Tên quá ngắn'),
  lastName: z.string().min(2, 'Họ quá ngắn'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const res = await api.post<{ user: any; accessToken: string }>('/auth/register', data);
      setAuth(res.user, res.accessToken);
      toast.success('Đăng ký thành công!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--gradient-hero)', padding: 24
    }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: 480, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'var(--gradient-emerald)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <Wallet size={24} color="white" />
          </div>
          <h2>Bắt đầu với FinWallet</h2>
          <p style={{ marginTop: 8 }}>Mở khóa sức mạnh quản lý tài chính cá nhân</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-col gap-4">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
             <div className="form-group">
              <label className="label"><User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}/> Tên</label>
              <input type="text" className="input" placeholder="An" {...register('firstName')} />
              {errors.firstName && <span style={{ fontSize: '0.75rem', color: 'var(--color-rose)' }}>{errors.firstName.message}</span>}
            </div>
            <div className="form-group">
              <label className="label"> Họ đệm</label>
              <input type="text" className="input" placeholder="Nguyễn Văn" {...register('lastName')} />
              {errors.lastName && <span style={{ fontSize: '0.75rem', color: 'var(--color-rose)' }}>{errors.lastName.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="label"><Mail size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}/> Email</label>
            <input type="email" className="input" placeholder="user@example.com" {...register('email')} />
            {errors.email && <span style={{ fontSize: '0.75rem', color: 'var(--color-rose)' }}>{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="label"><Lock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}/> Mật khẩu</label>
            <input type="password" className="input" placeholder="••••••••" {...register('password')} />
            {errors.password && <span style={{ fontSize: '0.75rem', color: 'var(--color-rose)' }}>{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn btn-emerald w-full" style={{ marginTop: 12 }} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : <><UserPlus size={18} /> Đăng ký tài khoản</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Đã có tài khoản? <Link href="/auth/login" style={{ color: 'var(--color-emerald-light)', fontWeight: 600 }}>Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
