'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { DownloadCloud, Info } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function AnalyticsPage() {
  const [cashflowData, setCashflowData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const year = new Date().getFullYear();
        const startOfMonth = new Date(year, new Date().getMonth(), 1).toISOString();
        const endOfMonth = new Date(year, new Date().getMonth() + 1, 0, 23,59,59).toISOString();

        const [cf, categories] = await Promise.all([
          api.get('/analytics/cashflow', { year }),
          api.get('/analytics/categories', { type: 'EXPENSE', startDate: startOfMonth, endDate: endOfMonth })
        ]);
        setCashflowData(cf as any);
        setPieData(categories as any[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card" style={{ padding: 12, border: '1px solid var(--color-border)' }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, fontSize: '0.85rem' }}>
              {entry.name}: {Number(entry.value).toLocaleString('vi-VN')} đ
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Thống kê & Báo cáo</h1>
          <p>Phân tích trực quan sức khỏe tài chính của bạn.</p>
        </div>
        <button className="btn btn-secondary">
          <DownloadCloud size={18} /> Xuất PDF
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 32 }}>
        {/* Cashflow Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 24 }}>Dòng tiền năm nay</h3>
          {loading ? (
            <div className="skeleton" style={{ height: 300, borderRadius: 12 }}></div>
          ) : (
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={cashflowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} 
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                  <Bar dataKey="income" name="Thu nhập" fill="var(--color-emerald)" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="expense" name="Chi tiêu" fill="var(--color-rose)" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 24 }}>Cơ cấu chi tiêu tháng này</h3>
            {loading ? (
              <div className="skeleton" style={{ height: 300, borderRadius: 12 }}></div>
            ) : pieData.length === 0 ? (
              <div className="flex-col items-center justify-center text-center" style={{ height: 300, color: 'var(--color-text-muted)' }}>
                <Info size={32} style={{ marginBottom: 12 }} />
                <p>Không có dữ liệu chi tiêu trong tháng</p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '50%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={100}
                        paddingAngle={5}
                        dataKey="amount"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ width: '50%', paddingLeft: 24 }}>
                  {pieData.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center" style={{ marginBottom: 16 }}>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color }} />
                        <span style={{ fontSize: '0.9rem' }}>{item.categoryName}</span>
                      </div>
                      <div style={{ fontWeight: 600 }}>{item.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: 24, background: 'var(--gradient-card)' }}>
            <h3 style={{ marginBottom: 16 }}>Gợi ý từ AI 🤖</h3>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              Dựa trên biểu đồ chi tiêu:
            </p>
            <ul style={{ paddingLeft: 20, color: 'var(--color-text-primary)', fontSize: '0.95rem', lineHeight: 1.8 }}>
              <li>Chi tiêu cho <b>Ăn uống</b> đang chiếm tỷ lệ cao nhất. Bạn có thể giảm bớt việc ăn ngoài để tiết kiệm thêm 10%.</li>
              <li>Dòng tiền tháng này dương, chúc mừng bạn đã duy trì tốt thói quen tiết kiệm.</li>
              <li>Hãy thiết lập hạn mức ngân sách cho mục <b>Giải trí</b> để tránh chi tiêu bốc đồng.</li>
            </ul>
            <div style={{ marginTop: 24 }}>
              <a href="/ai-advisor" className="btn btn-primary btn-sm">Trò chuyện chi tiết với AI</a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
