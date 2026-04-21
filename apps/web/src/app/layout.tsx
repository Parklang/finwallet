import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/Providers/ThemeProvider';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'FinWallet — Quản lý Tài chính Cá nhân',
  description: 'Ứng dụng quản lý tài chính cá nhân thông minh với AI. Theo dõi thu chi, lập ngân sách, và đạt mục tiêu tiết kiệm.',
  keywords: 'tài chính cá nhân, quản lý thu chi, ví điện tử, ngân sách, tiết kiệm',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FinWallet',
  },
  openGraph: {
    title: 'FinWallet',
    description: 'Quản lý tài chính cá nhân thông minh với AI',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563EB' },
    { media: '(prefers-color-scheme: dark)', color: '#1D4ED8' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
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

        {/* PWA — Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker
                  .register('/sw.js')
                  .then((reg) => console.log('[PWA] SW registered:', reg.scope))
                  .catch((err) => console.warn('[PWA] SW registration failed:', err));
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
