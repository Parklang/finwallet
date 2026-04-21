'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Filter, Search, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

function TransactionsContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const walletId = searchParams.get('walletId');

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 50 };
      if (walletId) params.walletId = walletId;
      if (search) params.search = search;
      if (type) params.type = type;

      const res: any = await api.get('/transactions', params);
      setTransactions(res.transactions);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [walletId, type]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const formatMoney = (val: number) => {
    return val?.toLocaleString('vi-VN') + ` ${user?.currency || 'VND'}`;
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Giao dịch</h1>
          <p>Lịch sử tất cả các khoản thu chi và chuyển khoản.</p>
        </div>
        <Link href="/transactions/new" className="btn btn-primary">
          <Plus size={18} /> Giao dịch mới
        </Link>
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <form onSubmit={handleSearchSubmit} className="flex gap-4">
          <div className="relative" style={{ flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: 14, color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="input"
              placeholder="Tìm kiếm giao dịch, ghi chú..."
              style={{ paddingLeft: 44 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="input"
            style={{ width: 180, appearance: 'none' }}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Tất cả loại thẻ</option>
            <option value="EXPENSE">Chi tiêu</option>
            <option value="INCOME">Thu nhập</option>
            <option value="TRANSFER">Chuyển khoản</option>
          </select>

          <button type="button" className="btn btn-secondary">
            <Filter size={18} /> Lọc thêm
          </button>
        </form>
      </div>

      <div className="glass-card table-container">
        <table>
          <thead>
            <tr>
              <th>Chi tiết &amp; Nguồn</th>
              <th>Danh mục</th>
              <th>Ngày</th>
              <th>Loại</th>
              <th style={{ textAlign: 'right' }}>Số tiền</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center" style={{ padding: 40 }}>Đang tải dữ liệu...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={5} className="text-center" style={{ padding: 40, color: 'var(--color-text-muted)' }}>Không tìm thấy giao dịch nào</td></tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tx.description || 'Giao dịch không tên'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {tx.type === 'TRANSFER'
                        ? `${tx.fromWallet?.name} → ${tx.toWallet?.name}`
                        : (tx.fromWallet?.name || tx.toWallet?.name)}
                    </div>
                  </td>
                  <td>
                    {tx.category ? (
                      <div className="badge" style={{ background: `${tx.category.color}22`, color: tx.category.color }}>
                        {tx.category.name}
                      </div>
                    ) : '-'}
                  </td>
                  <td>{new Date(tx.date).toLocaleDateString('vi-VN')} {new Date(tx.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <span className={`badge badge-${tx.type.toLowerCase()}`}>
                      {tx.type === 'EXPENSE' ? 'Chi tiêu' : tx.type === 'INCOME' ? 'Thu nhập' : 'Chuyển khoản'}
                    </span>
                  </td>
                  <td style={{
                    textAlign: 'right', fontWeight: 700,
                    color: tx.type === 'EXPENSE' ? 'var(--color-rose)' : tx.type === 'INCOME' ? 'var(--color-emerald)' : 'var(--color-blue)'
                  }}>
                    {tx.type === 'EXPENSE' ? '-' : tx.type === 'INCOME' ? '+' : ''}{formatMoney(Number(tx.amount))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Đang tải...
        </div>
      </DashboardLayout>
    }>
      <TransactionsContent />
    </Suspense>
  );
}
