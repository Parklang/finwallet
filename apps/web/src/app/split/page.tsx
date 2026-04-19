'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Users, Plus, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function BillSplitPage() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/bill-split');
        setSessions(res as any);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const formatMoney = (val: number) => {
    return val?.toLocaleString('vi-VN') + ` ${user?.currency || 'VND'}`;
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Chia tiền nhóm</h1>
          <p>Quản lý và theo dõi các khoản chi tiêu chung với bạn bè.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> Tạo nhóm chia mới
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
        {loading ? (
           <div className="stat-card skeleton" style={{ height: 200 }}></div>
        ) : sessions.length === 0 ? (
          <div className="glass-card flex-col items-center justify-center text-center w-full" style={{ padding: 40, gridColumn: '1 / -1' }}>
            <Users size={48} color="var(--color-text-muted)" style={{ marginBottom: 16 }} />
            <h3>Chưa có nhóm chia tiền nào</h3>
            <p style={{ marginTop: 8, marginBottom: 24 }}>Tạo phiên chia tiền mới để dễ dàng quản lý chi phí chung (du lịch, ăn uống...).</p>
            <button className="btn btn-emerald">Tạo phiên chia tiền</button>
          </div>
        ) : (
          sessions.map(session => {
            const totalPaid = session.participants.filter((p:any) => p.isPaid).reduce((s:number, p:any) => s + Number(p.amount), 0);
            const isCompleted = totalPaid >= Number(session.totalAmount);

            return (
              <div key={session.id} className="glass-card" style={{ padding: 24, position: 'relative' }}>
                {isCompleted && (
                  <div className="badge badge-income" style={{ position: 'absolute', top: 16, right: 16 }}>Đã thanh toán đủ</div>
                )}
                {!isCompleted && (
                  <div className="badge badge-warning" style={{ position: 'absolute', top: 16, right: 16 }}>Đang thu báo</div>
                )}
                
                <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>{session.title}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>
                  {new Date(session.createdAt).toLocaleDateString('vi-VN')}
                </div>

                <div style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 20 }}>
                  {formatMoney(Number(session.totalAmount))}
                </div>

                <div className="flex-col gap-2">
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Thành viên ({session.participants.length})</div>
                  {session.participants.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center" style={{ padding: '8px 12px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'white' }}>
                          {p.name[0]}
                        </div>
                        <span style={{ fontSize: '0.9rem' }}>{p.name} {p.userId === user?.id && '(Bạn)'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{formatMoney(Number(p.amount))}</span>
                        {p.isPaid ? (
                          <CheckCircle size={16} color="var(--color-emerald)" />
                        ) : (
                          <Clock size={16} color="var(--color-secondary)" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
