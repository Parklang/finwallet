'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { ArrowUpRight, ArrowDownRight, Activity, Wallet as WalletIcon } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

// Skeleton Component
const SkeletonCard = () => (
  <div className="stat-card skeleton" style={{ height: 140 }}></div>
);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res);
      } catch (error) {
        console.error('Failed to fetch dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formatMoney = (val: number) => {
    return val?.toLocaleString('vi-VN') + ` ${user?.currency || 'VND'}`;
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem' }}>Chào buổi sáng, {user?.firstName}! 👋</h1>
        <p>Đây là tổng quan tài chính của bạn trong tháng này.</p>
      </div>

      {loading ? (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
            <div className="stat-card primary">
              <div className="label">Tổng số dư</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>{formatMoney(data?.overview?.totalBalance)}</div>
              <div className="badge badge-transfer"><WalletIcon size={12}/> {data?.wallets?.length || 0} Ví đang hoạt động</div>
            </div>
            <div className="stat-card emerald">
              <div className="label">Thu nhập (Tháng này)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>{formatMoney(data?.overview?.monthIncome)}</div>
              <div className="badge badge-income"><ArrowUpRight size={12}/> +12% so với tháng trước</div>
            </div>
            <div className="stat-card rose">
              <div className="label">Chi tiêu (Tháng này)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>{formatMoney(data?.overview?.monthExpense)}</div>
              <div className="badge badge-expense"><ArrowDownRight size={12}/> Vượt mức trung bình</div>
            </div>
            <div className="stat-card secondary">
              <div className="label">Tiết kiệm được</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>
                {formatMoney(data?.overview?.monthIncome - data?.overview?.monthExpense)}
              </div>
              <div className="badge badge-warning"><Activity size={12}/> Đạt 80% mục tiêu</div>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            {/* Recent Transactions */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
                <h3>Giao dịch gần đây</h3>
                <a href="/transactions" className="btn btn-secondary btn-sm">Xem tất cả</a>
              </div>
              
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Chi tiết</th>
                      <th>Danh mục</th>
                      <th>Ngày</th>
                      <th style={{ textAlign: 'right' }}>Số tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recentTransactions?.length === 0 ? (
                      <tr><td colSpan={4} className="text-center">Chưa có giao dịch nào</td></tr>
                    ) : (
                      data?.recentTransactions?.map((tx: any) => (
                        <tr key={tx.id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{tx.description}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                              {tx.fromWallet?.name || tx.toWallet?.name}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              {tx.category ? (
                                <><span style={{ color: tx.category.color }}>●</span> {tx.category.name}</>
                              ) : '-'}
                            </div>
                          </td>
                          <td>{new Date(tx.date).toLocaleDateString('vi-VN')}</td>
                          <td style={{ 
                            textAlign: 'right', fontWeight: 700,
                            color: tx.type === 'EXPENSE' ? 'var(--color-rose)' : 'var(--color-emerald)'
                          }}>
                            {tx.type === 'EXPENSE' ? '-' : '+'}{formatMoney(tx.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Budgets Overview */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3>Ngân sách của bạn</h3>
              <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>Tháng này</p>

              <div className="flex-col gap-6">
                {data?.budgets?.length === 0 ? (
                  <div className="text-center" style={{ padding: 20, color: 'var(--color-text-muted)' }}>
                    Chưa thiết lập ngân sách
                  </div>
                ) : (
                  data?.budgets?.map((b: any) => (
                    <div key={b.id}>
                      <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
                        <span style={{ fontWeight: 600 }}>{b.category?.name || b.name}</span>
                        <span style={{ fontSize: '0.85rem' }}>
                          {formatMoney(b.spent)} / {formatMoney(b.amount)}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${Math.min(b.percentage, 100)}%`,
                            backgroundColor: b.percentage >= 100 ? 'var(--color-rose)' : 
                                           b.percentage >= b.alertAt ? 'var(--color-secondary)' : 'var(--color-emerald)'
                          }} 
                        />
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--color-text-muted)', textAlign: 'right' }}>
                        Đã dùng {b.percentage}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
