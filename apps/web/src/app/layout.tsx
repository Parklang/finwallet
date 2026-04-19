import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/Providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'FinWallet — Quản lý Tài chính Cá nhân',
  description: 'Ứng dụng quản lý tài chính cá nhân thông minh với AI. Theo dõi thu chi, lập ngân sách, và đạt mục tiêu tiết kiệm.',
  keywords: 'tài chính cá nhân, quản lý thu chi, ví điện tử, ngân sách, tiết kiệm',
  openGraph: {
    title: 'FinWallet',
    description: 'Quản lý tài chính cá nhân thông minh với AI',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
