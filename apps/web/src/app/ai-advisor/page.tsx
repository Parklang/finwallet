'use client';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api-client';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function AiAdvisorPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch chat history
    api.get<any[]>('/ai/chat/history').then(res => {
      setMessages(res || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    try {
      setIsLoading(true);
      const res = await api.post<any>('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, tôi đang gặp lỗi kết nối. Hãy thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gradient-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              AI Financial Advisor <Sparkles size={18} color="var(--color-secondary-light)" />
            </h1>
            <p style={{ fontSize: '0.85rem' }}>Trợ lý phân tích dòng tiền và tư vấn dựa trên dữ liệu của bạn</p>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>
        
        {/* Chat window */}
        <div style={{ flex: 1, padding: 32, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div style={{ alignSelf: 'center', textAlign: 'center', marginTop: 40, maxWidth: 400 }}>
              <Bot size={64} color="var(--color-primary)" style={{ marginBottom: 16, opacity: 0.8 }} />
              <h3 style={{ marginBottom: 8 }}>Chào {user?.firstName}, tôi có thể giúp gì?</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Bạn có thể hỏi tôi về số dư ví, phân tích thói quen ăn uống, 
                gợi ý cách tiết kiệm tiền hoặc xem báo cáo tháng này.
              </p>
              
              <div className="flex-col gap-2" style={{ marginTop: 32, alignItems: 'center' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setInput('Tháng này tôi chi nhiều nhất vào mục nào?')}>Tháng này tôi chi nhiều nhất vào mục nào?</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setInput('Gợi ý cách tiết kiệm 20% thu nhập')}>Gợi ý cách tiết kiệm 20% thu nhập</button>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 12 
            }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={16} color="white" />
                </div>
              )}
              
              <div style={{
                maxWidth: '70%', padding: '12px 18px', borderRadius: 'var(--radius-lg)',
                background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-bg-hover)',
                color: 'white', fontSize: '0.95rem', lineHeight: 1.6,
                borderBottomRightRadius: msg.role === 'user' ? 4 : undefined,
                borderBottomLeftRadius: msg.role === 'assistant' ? 4 : undefined,
                whiteSpace: 'pre-line'
              }}>
                {msg.content}
              </div>

              {msg.role === 'user' && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} color="var(--color-text-muted)" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={16} color="white" />
              </div>
              <div style={{ background: 'var(--color-bg-hover)', padding: '12px 18px', borderRadius: 'var(--radius-lg)', fontSize: '0.9rem' }}>
                <span className="dot-typing">Đang suy nghĩ...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '20px 32px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <input 
              type="text" 
              className="input" 
              placeholder="Hỏi AI về tình hình tài chính của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
              disabled={isLoading}
              style={{ background: 'var(--color-bg-secondary)' }}
            />
            <button 
              className="btn btn-primary" 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{ padding: '0 24px' }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
