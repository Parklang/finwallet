'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Wallet as WalletIcon, Plus, MoreHorizontal, CheckCircle, CreditCard, Landmark, PiggyBank, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

export default function WalletsPage() {
  const { user } = useAuthStore();
  const [wallets, setWallets] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newWallet, setNewWallet] = useState({
    name: '',
    type: 'BANK_ACCOUNT',
    initialBalance: 0,
    color: '#3B82F6'
  });

  const fetchWallets = async () => {
    try {
      const res = await api.get<{wallets: any[], totalBalance: number}>('/wallets');
      setWallets(res.wallets);
      setTotalBalance(res.totalBalance);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách ví');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWallet.name) return toast.error('Vui lòng nhập tên ví');
    
    setIsSubmitting(true);
    try {
      await api.post('/wallets', newWallet);
      toast.success('Đã thêm ví mới!');
      setIsModalOpen(false);
      setNewWallet({ name: '', type: 'BANK_ACCOUNT', initialBalance: 0, color: '#3B82F6' });
      fetchWallets();
    } catch (error) {
      toast.error('Không thể thêm ví');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const formatMoney = (val: number) => {
    return val?.toLocaleString('vi-VN') + ` ${user?.currency || 'VND'}`;
  };

  const getWalletIcon = (type: string) => {
    switch(type) {
      case 'BANK_ACCOUNT': return <Landmark size={24} />;
      case 'CREDIT_CARD': return <CreditCard size={24} />;
      case 'SAVINGS': return <PiggyBank size={24} />;
      default: return <WalletIcon size={24} />;
    }
  };

  const getWalletTypeName = (type: string) => {
    switch(type) {
      case 'CASH': return 'Tiền mặt';
      case 'BANK_ACCOUNT': return 'Tài khoản ngân hàng';
      case 'CREDIT_CARD': return 'Thẻ tín dụng';
      case 'E_WALLET': return 'Ví điện tử';
      case 'SAVINGS': return 'Tài khoản tiết kiệm';
      case 'INVESTMENT': return 'Đầu tư';
      default: return 'Khác';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Ví của tôi</h1>
          <p>Quản lý tất cả các tài khoản và ví lưu trữ tiền của bạn.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Thêm ví mới
        </button>
      </div>

      <div className="glass-card" style={{ padding: 32, marginBottom: 32, background: 'var(--gradient-primary)', border: 'none' }}>
        <div style={{ color: 'rgba(255,255,255,0.8)' }}>Tổng tài sản (Net Worth)</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginTop: 8 }}>
          {formatMoney(totalBalance)}
        </div>
      </div>

      <h3 style={{ marginBottom: 20 }}>Tài khoản đang hoạt động</h3>

      {loading ? (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
           <div className="stat-card skeleton" style={{ height: 180 }}></div>
           <div className="stat-card skeleton" style={{ height: 180 }}></div>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {wallets.map((wallet) => (
            <div key={wallet.id} className="glass-card" style={{ 
              padding: 24, position: 'relative', overflow: 'hidden', 
              borderLeft: `4px solid ${wallet.color || 'var(--color-primary)'}` 
            }}>
              {wallet.isDefault && (
                <div style={{ position: 'absolute', top: 16, right: 16, color: 'var(--color-emerald)' }} title="Ví mặc định">
                  <CheckCircle size={20} />
                </div>
              )}
              
              <div className="flex items-center gap-4" style={{ marginBottom: 24 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, 
                  background: `${wallet.color || 'var(--color-primary)'}20`,
                  color: wallet.color || 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {getWalletIcon(wallet.type)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 2 }}>{wallet.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{getWalletTypeName(wallet.type)}</div>
                </div>
              </div>

              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                {formatMoney(Number(wallet.balance))}
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                <a href={`/transactions?walletId=${wallet.id}`} style={{ fontSize: '0.85rem', fontWeight: 600 }}>Xem lịch sử</a>
                <button className="btn btn-secondary btn-icon" style={{ border: 'none' }}><MoreHorizontal size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Wallet Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 450, padding: 32, position: 'relative' }}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: 24 }}>Thêm Ví Mới</h2>

            <form onSubmit={handleAddWallet} className="flex-col gap-4">
              <div className="form-group">
                <label className="label">Tên ví / Tài khoản</label>
                <input 
                  type="text" className="input" placeholder="Ví dụ: TPBank, Ví Momo" required
                  value={newWallet.name} onChange={e => setNewWallet({...newWallet, name: e.target.value})}
                />
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="label">Loại ví</label>
                  <select 
                    className="input" 
                    value={newWallet.type} onChange={e => setNewWallet({...newWallet, type: e.target.value})}
                  >
                    <option value="CASH">Tiền mặt</option>
                    <option value="BANK_ACCOUNT">Ngân hàng</option>
                    <option value="CREDIT_CARD">Thẻ tín dụng</option>
                    <option value="E_WALLET">Ví điện tử</option>
                    <option value="SAVINGS">Tiết kiệm</option>
                    <option value="INVESTMENT">Đầu tư</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="label">Số dư ban đầu</label>
                  <input 
                    type="number" className="input" placeholder="0" min="0"
                    value={newWallet.initialBalance} onChange={e => setNewWallet({...newWallet, initialBalance: Number(e.target.value)})}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: 12 }} disabled={isSubmitting}>
                {isSubmitting ? 'Đang thêm...' : 'Lưu ví mới'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
