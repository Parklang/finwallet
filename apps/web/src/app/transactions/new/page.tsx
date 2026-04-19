'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api-client';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Camera, Bot, Sparkles, QrCode, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Scanner } from '@yudiel/react-qr-scanner';

const schema = z.object({
  type: z.enum(['EXPENSE', 'INCOME', 'TRANSFER']),
  amount: z.string().min(1, 'Vui lòng nhập số tiền'),
  fromWalletId: z.string().optional(),
  toWalletId: z.string().optional(),
  categoryId: z.string().optional(),
  description: z.string().min(2, 'Vui lòng nhập mô tả'),
  date: z.string(),
  note: z.string().optional(),
});

type FormData = z.input<typeof schema>;

export default function NewTransactionPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isAiCategorizing, setIsAiCategorizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'EXPENSE',
      date: new Date().toISOString().substring(0, 16),
      amount: '',
    }
  });

  const txType = watch('type');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletsRes, catsRes] = await Promise.all([
          api.get<{wallets: any[]}>('/wallets'),
          api.get<any[]>('/categories'),
        ]);
        setWallets(walletsRes.wallets);
        if (walletsRes.wallets.length > 0) {
          setValue('fromWalletId', walletsRes.wallets[0].id);
          setValue('toWalletId', walletsRes.wallets[0].id);
        }
        setCategories(catsRes);
      } catch (error) {
        toast.error('Lỗi khi tải dữ liệu cấu hình');
      }
    };
    fetchData();
  }, [setValue]);

  const handleAI_Categorize = async (description: string) => {
    if (!description || description.length < 3 || txType !== 'EXPENSE') return;
    
    try {
      setIsAiCategorizing(true);
      const res = await api.post<{ categoryName: string, confidence: number }>('/ai/categorize', { description });
      
      const foundCat = categories.find(c => c.name.toLowerCase() === res.categoryName.toLowerCase());
      if (foundCat && res.confidence > 60) {
        setValue('categoryId', foundCat.id);
        toast.success(`AI phân loại: ${foundCat.name} (${res.confidence}%)`, { icon: '🤖' });
      }
    } catch (error) {
      console.error('AI categorization error', error);
    } finally {
      setIsAiCategorizing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsScanning(true);
      const toastId = toast.loading('Đang quét OCR hóa đơn bằng AI...');
      
      const res = await api.post<any>('/ai/scan-receipt', formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.dismiss(toastId);
      toast.success('Đã quét xong hóa đơn!');

      if (res.amount) setValue('amount', res.amount.toString());
      if (res.description) {
        setValue('description', res.description);
        await handleAI_Categorize(res.description);
      }
      if (res.date) {
        // basic date formatting to YYYY-MM-DDTHH:mm
        setValue('date', `${res.date}T12:00`);
      }
    } catch (error) {
      setIsScanning(false);
      toast.error('Không thể quét hóa đơn');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleQrScanned = async (text: string) => {
    setIsQrScannerOpen(false);
    if (!text) return;
    
    const toastId = toast.loading('Đang phân tích mã QR bằng AI...');
    try {
      const res = await api.post<{amount: number, description: string}>('/ai/parse-qr', { qrData: text });
      toast.dismiss(toastId);
      
      setValue('type', 'TRANSFER');
      if (res.amount) {
        setValue('amount', res.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
      }
      if (res.description) {
        setValue('description', res.description);
      }
      toast.success('Quét VietQR thành công!');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Không thể phân tích mã QR');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const numericAmount = Number(data.amount.replace(/\D/g, ''));
      const payload = { ...data, amount: numericAmount };
      if (payload.type === 'EXPENSE') delete payload.toWalletId;
      if (payload.type === 'INCOME') delete payload.fromWalletId;

      await api.post('/transactions', payload);
      toast.success('Đã thêm giao dịch thành công!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Giao dịch mới</h1>
        <p style={{ marginBottom: 32 }}>Thêm khoản thu, chi hoặc chuyển khoản.</p>

        <div className="glass-card" style={{ padding: 32, position: 'relative' }}>
          
          {/* AI Banner */}
          <div style={{ 
            background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)',
            padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
          }}>
            <div className="flex items-center gap-3">
              <Bot color="var(--color-primary-light)" size={28} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>Nhập liệu nhanh bằng OCR & QR</div>
                <div style={{ fontSize: '0.85rem' }}>AI tự động trích xuất hoá đơn hoặc quét VietQR chuyển khoản</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileUpload} />
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
              >
                {isScanning ? 'Đang quét...' : <><Camera size={16} /> Hóa đơn</>}
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-sm" 
                onClick={() => setIsQrScannerOpen(true)}
              >
                <QrCode size={16} /> Quét QR
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex-col gap-6">
            
            {/* Type selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, background: 'var(--color-bg-tertiary)', padding: 6, borderRadius: 'var(--radius-md)' }}>
              {['EXPENSE', 'INCOME', 'TRANSFER'].map(t => (
                <button
                  key={t} type="button"
                  onClick={() => setValue('type', t as any)}
                  style={{
                    padding: '10px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 600,
                    background: txType === t 
                      ? (t === 'EXPENSE' ? 'var(--color-rose)' : t === 'INCOME' ? 'var(--color-emerald)' : 'var(--color-blue)') 
                      : 'transparent',
                    color: txType === t ? 'white' : 'var(--color-text-secondary)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {t === 'EXPENSE' ? 'Chi tiêu (-)' : t === 'INCOME' ? 'Thu nhập (+)' : 'Chuyển khoản'}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label className="label">Số tiền (VND)</label>
              <input 
                type="text" className="input" placeholder="50.000" style={{ fontSize: '1.5rem', fontWeight: 700 }}
                {...register('amount')} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  e.target.value = val ? Number(val).toLocaleString('vi-VN') : '';
                  setValue('amount', val, { shouldValidate: true });
                }}
              />
              {errors.amount && <span style={{ color: 'var(--color-rose)', fontSize: '0.8rem' }}>{(errors.amount as any).message}</span>}
            </div>

            <div className="form-group relative">
              <label className="label">Chi tiết (AI có thể phân loại tự động) {isAiCategorizing && <Sparkles size={14} className="animate-pulse-glow" style={{ color: 'var(--color-secondary)', display: 'inline', marginLeft: 6}}/>}</label>
              <input 
                type="text" className="input" placeholder="Ví dụ: Cà phê Highland"
                {...register('description')}
                onBlur={(e) => handleAI_Categorize(e.target.value)}
              />
              {errors.description && <span style={{ color: 'var(--color-rose)', fontSize: '0.8rem' }}>{(errors.description as any).message}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {(txType === 'EXPENSE' || txType === 'TRANSFER') && (
                <div className="form-group">
                  <label className="label">Ví nguồn (Trừ tiền)</label>
                  <select className="input" {...register('fromWalletId')}>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({Number(w.balance).toLocaleString('vi-VN')} đ)</option>)}
                  </select>
                </div>
              )}

              {(txType === 'INCOME' || txType === 'TRANSFER') && (
                <div className="form-group">
                  <label className="label">Ví đích (Cộng tiền)</label>
                  <select className="input" {...register('toWalletId')}>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({Number(w.balance).toLocaleString('vi-VN')} đ)</option>)}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {txType !== 'TRANSFER' && (
                <div className="form-group">
                  <label className="label">Danh mục</label>
                  <select className="input" {...register('categoryId')}>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.filter(c => c.type === txType).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="label">Ngày giờ</label>
                <input type="datetime-local" className="input" {...register('date')} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Ghi chú thêm</label>
              <textarea className="input" rows={3} placeholder="Mô tả chi tiết tùy chọn..." {...register('note')} />
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" style={{ marginTop: 24 }} disabled={!isValid}>
              Lưu giao dịch
            </button>
          </form>

        </div>
      </div>

      {/* QR Scanner Modal */}
      {isQrScannerOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 400, padding: 24, position: 'relative', textAlign: 'center' }}>
            <button 
              onClick={() => setIsQrScannerOpen(false)} 
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: 12 }}>Quét VietQR</h2>
            <p style={{ marginBottom: 24, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Di chuyển mã QR vào giữa khung hình</p>
            <div style={{ borderRadius: 16, overflow: 'hidden' }}>
              <Scanner onScan={(result) => {
                const text = result?.[0]?.rawValue;
                if (text) {
                  handleQrScanned(text);
                }
              }} />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
