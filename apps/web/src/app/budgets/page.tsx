'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { PieChart, Plus, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function BudgetsPage() {
  const { user } = useAuthStore();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await api.get('/budgets');
        setBudgets(res as any);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  const formatMoney = (val: number) => {
    return val?.toLocaleString('vi-VN') + ` ${user?.currency || 'VND'}`;
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Ngân sách</h1>
          <p>Kiểm soát chi tiêu theo từng danh mục.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> Lập ngân sách
        </button>
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
        <h3 style={{ marginBottom: 20 }}>Tổng quan ngân sách tháng này</h3>
        {loading ? (
          <div className="skeleton" style={{ height: 80, borderRadius: 12 }}></div>
        ) : (
          <div>
            <div className="flex justify-between items-end" style={{ marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>
                  {formatMoney(budgets.reduce((s, b) => s + Number(b.spent), 0))}
                </div>
                <div style={{ color: 'var(--color-text-muted)' }}>
                  Đã chi tiêu trong tổng {formatMoney(budgets.reduce((s, b) => s + Number(b.amount), 0))}
                </div>
              </div>
            </div>
            <div className="progress-bar" style={{ height: 16 }}>
               {/* Simplified total progress bar */}
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${Math.min(
                    (budgets.reduce((s, b) => s + Number(b.spent), 0) / 
                     (budgets.reduce((s, b) => s + Number(b.amount), 0) || 1)) * 100, 
                  100)}%`,
                  background: 'var(--color-primary)' 
                }} 
              />
            </div>
          </div>
        )}
      </div>

      <h3 style={{ marginBottom: 20 }}>Chi tiết từng mục</h3>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {budgets.map(b => (
          <div key={b.id} className={`glass-card ${b.isOverspent ? 'overspent' : ''}`} style={{ 
            padding: 24, 
            border: b.isOverspent ? '1px solid var(--color-rose)' : undefined 
          }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
              <div className="flex items-center gap-2">
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: b.color || 'var(--color-primary)' }} />
                <h4 style={{ fontSize: '1.1rem' }}>{b.category?.name || b.name}</h4>
              </div>
              {b.isOverspent && (
                <div className="badge badge-expense"><AlertTriangle size={12}/> Vượt mức</div>
              )}
              {b.isWarning && !b.isOverspent && (
                <div className="badge badge-warning">Sắp hết</div>
              )}
            </div>

            <div className="flex justify-between items-end" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: b.isOverspent ? 'var(--color-rose)' : 'var(--color-text-primary)' }}>
                {formatMoney(Number(b.spent))}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                / {formatMoney(Number(b.amount))}
              </div>
            </div>

            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${Math.min(b.percentage, 100)}%`,
                  backgroundColor: b.isOverspent ? 'var(--color-rose)' : b.isWarning ? 'var(--color-secondary)' : 'var(--color-emerald)'
                }} 
              />
            </div>
            
            <div className="flex justify-between items-center" style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              <span>Đã dùng {b.percentage}%</span>
              <span>{b.isOverspent ? 'Vượt quá ' : 'Còn lại '}{formatMoney(Math.abs(b.remaining))}</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
