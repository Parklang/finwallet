'use client';
// ============================================================
// LANDING PAGE — FinWallet Home
// ============================================================
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, Shield, Zap, PieChart,
  ArrowRight, Star, CheckCircle, Bot, Receipt
} from 'lucide-react';

const features = [
  { icon: Wallet,    title: 'Quản lý Đa Ví',       desc: 'Tiền mặt, ngân hàng, thẻ tín dụng — tất cả trong một nơi',  color: '#7C3AED' },
  { icon: PieChart,  title: 'Phân tích Thông minh', desc: 'Biểu đồ thu chi trực quan, phân loại tự động theo danh mục', color: '#10B981' },
  { icon: TrendingUp,title: 'Mục tiêu Tiết kiệm',  desc: 'Lập mục tiêu, theo dõi tiến độ và đạt được ước mơ tài chính', color: '#3B82F6' },
  { icon: Shield,    title: 'Bảo mật Cao',          desc: 'JWT, mã hóa AES-256, audit logs — dữ liệu của bạn luôn an toàn', color: '#F43F5E' },
  { icon: Bot,       title: 'AI Tư vấn Tài chính',  desc: 'Chatbot AI cá nhân hóa, phân loại giao dịch tự động',         color: '#F59E0B' },
  { icon: Receipt,   title: 'Quét Hóa đơn OCR',     desc: 'Chụp ảnh hóa đơn, AI tự động nhập số tiền và danh mục',       color: '#06B6D4' },
];

const stats = [
  { value: '10K+', label: 'Người dùng' },
  { value: '5M+',  label: 'Giao dịch' },
  { value: '99.9%',label: 'Uptime' },
  { value: '4.9★', label: 'Đánh giá' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(6,7,26,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--gradient-purple)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Wallet size={20} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Fin<span className="gradient-text">Wallet</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/auth/login" className="btn btn-secondary btn-sm">Đăng nhập</Link>
          <Link href="/auth/register" className="btn btn-primary btn-sm">Bắt đầu miễn phí</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 70%)',
      }}>
        <div className="animate-fade-in" style={{ maxWidth: 800 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 20px', borderRadius: 'var(--radius-full)',
            background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
            marginBottom: 32, fontSize: '0.85rem', color: 'var(--color-primary-light)',
          }}>
            <Zap size={14} /> AI-Powered Personal Finance
          </div>

          <h1 style={{ marginBottom: 24, letterSpacing: '-0.03em' }}>
            Kiểm soát hoàn toàn
            <br />
            <span className="gradient-text">Tài chính cá nhân</span> của bạn
          </h1>

          <p style={{ fontSize: '1.2rem', marginBottom: 40, lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
            Theo dõi thu chi thông minh, lập ngân sách tự động, tư vấn tài chính bằng AI —
            tất cả trong một ứng dụng bảo mật cấp ngân hàng.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Bắt đầu miễn phí <ArrowRight size={18} />
            </Link>
            <Link href="#features" className="btn btn-secondary btn-lg">
              Khám phá tính năng
            </Link>
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24, marginTop: 80, maxWidth: 600, margin: '80px auto 0',
          }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2>Tính năng <span className="gradient-text">toàn diện</span></h2>
          <p style={{ marginTop: 16, fontSize: '1.1rem' }}>Mọi thứ bạn cần để quản lý tài chính cá nhân hiệu quả</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: 32, animationDelay: `${i * 0.1}s` }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${f.color}22`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: 20,
              }}>
                <f.icon size={24} color={f.color} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(124,58,237,0.1) 0%, transparent 70%)',
      }}>
        <h2 style={{ marginBottom: 16 }}>Sẵn sàng <span className="gradient-text">bắt đầu?</span></h2>
        <p style={{ marginBottom: 40 }}>Miễn phí hoàn toàn. Không cần thẻ tín dụng.</p>
        <Link href="/auth/register" className="btn btn-primary btn-lg animate-pulse-glow">
          Tạo tài khoản ngay <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px', textAlign: 'center',
        borderTop: '1px solid var(--color-border)',
        color: 'var(--color-text-muted)', fontSize: '0.85rem',
      }}>
        © 2025 FinWallet. Built with ❤️ using Next.js + NestJS + PostgreSQL
      </footer>
    </div>
  );
}
