'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Target, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function GoalsPage() {
  const { user } = useAuthStore();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await api.get('/goals');
        setGoals(res as any);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const formatMoney = (val: number) => {
    return val?.toLocaleString('vi-VN') + ` ${user?.currency || 'VND'}`;
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Mục tiêu tiết kiệm</h1>
          <p>Lên kế hoạch và theo dõi các hũ tài chính của bạn.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> Thêm mục tiêu
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
        {loading ? (
           <div className="stat-card skeleton" style={{ height: 200 }}></div>
        ) : goals.length === 0 ? (
          <div className="glass-card flex-col items-center justify-center text-center w-full" style={{ padding: 40, gridColumn: '1 / -1' }}>
            <Target size={48} color="var(--color-text-muted)" style={{ marginBottom: 16 }} />
            <h3>Chưa có mục tiêu nào</h3>
            <p style={{ marginTop: 8, marginBottom: 24 }}>Tạo một hũ tài chính để bắt đầu tiết kiệm cho tương lai.</p>
            <button className="btn btn-emerald">Tạo mục tiêu đầu tiên</button>
          </div>
        ) : (
          goals.map(goal => (
            <div key={goal.id} className="glass-card" style={{ padding: 24, position: 'relative' }}>
              {goal.isCompleted && (
                <div className="badge badge-income" style={{ position: 'absolute', top: 16, right: 16 }}>Hoàn thành! 🎉</div>
              )}
              
              <div className="flex items-center gap-4" style={{ marginBottom: 24 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: `${goal.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                }}>
                  {goal.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{goal.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Mục tiêu: {formatMoney(Number(goal.targetAmount))}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>
                {formatMoney(Number(goal.currentAmount))}
              </div>

              <div className="progress-bar" style={{ height: 10, background: 'var(--color-bg-tertiary)' }}>
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${goal.percentage}%`, 
                    background: `linear-gradient(90deg, ${goal.color}, ${goal.color}dd)` 
                  }} 
                />
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: 12, fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>{goal.percentage}%</span>
                {goal.remaining > 0 && <span style={{ color: 'var(--color-text-secondary)' }}>Còn lại {formatMoney(goal.remaining)}</span>}
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                <button className="btn btn-secondary w-full" disabled={goal.isCompleted}>
                  <Plus size={16} /> Nạp thêm tiền
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
