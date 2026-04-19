'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Wallet, PieChart, Target, Users, Settings, 
  LogOut, PlusCircle, LayoutDashboard, Receipt, Bot, Bell, Sun, Moon
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api-client';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const menuItems = [
    { name: 'Tổng quan', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Ví của tôi', icon: Wallet, path: '/wallets' },
    { name: 'Giao dịch', icon: Receipt, path: '/transactions' },
    { name: 'Ngân sách', icon: PieChart, path: '/budgets' },
    { name: 'Mục tiêu', icon: Target, path: '/goals' },
    { name: 'Chia tiền nhóm', icon: Users, path: '/split' },
    { name: 'AI Advisor', icon: Bot, path: '/ai-advisor' },
    { name: 'Thống kê & Báo cáo', icon: PieChart, path: '/analytics' },
  ];

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {}
    logout();
    router.push('/auth/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--gradient-purple)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Wallet size={18} color="white" />
        </div>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
          Fin<span className="gradient-text">Wallet</span>
        </span>
      </div>

      {/* Quick Add Button */}
      <div style={{ padding: '0 16px 20px' }}>
        <Link href="/transactions/new" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
          <PlusCircle size={18} /> Giao dịch mới
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Area */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user?.firstName?.[0] || 'U'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Cơ bản</div>
            </div>
          </div>
          <button 
           onClick={() => router.push('/notifications')}
           style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--color-rose)', borderRadius: '50%' }} />
            )}
          </button>
        </div>

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="nav-item w-full" 
          style={{ margin: '0 0 4px 0', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', color: 'var(--color-text-secondary)' }}
        >
          {mounted && theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} 
          Đổi màu (Sáng / Tối)
        </button>

        <Link href="/settings" className="nav-item" style={{ margin: '0 0 4px 0', padding: '8px 12px' }}>
          <Settings size={16} /> Cài đặt
        </Link>
        <button onClick={handleLogout} className="nav-item w-full" style={{ margin: 0, padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', color: 'var(--color-rose-light)' }}>
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
