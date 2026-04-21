'use client';
// ============================================================
// OAUTH CALLBACK PAGE — Xử lý redirect từ Google OAuth
// Route: /auth/callback?accessToken=...&refreshToken=...
// ============================================================
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      // Lưu token vào localStorage (hoặc cookie)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Redirect vào dashboard
      router.replace('/dashboard');
    } else {
      // OAuth thất bại → redirect về trang login
      router.replace('/auth/login?error=oauth_failed');
    }
  }, [searchParams, router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-primary)',
      gap: 16,
    }}>
      {/* Spinner */}
      <div style={{
        width: 48, height: 48,
        border: '4px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
        Đang xử lý đăng nhập...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
