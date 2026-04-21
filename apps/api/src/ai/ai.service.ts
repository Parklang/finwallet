// ============================================================
// AI SERVICE — Section 12: AI Features
// Google Gemini API Integration
// ============================================================
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel | null = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey && apiKey !== 'your-gemini-api-key') {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
  }

  // Auto-categorize transaction from description
  async categorizeTransaction(
    description: string,
    userId: string,
  ): Promise<{ categoryName: string; confidence: number }> {
    const categories = await this.prisma.category.findMany({
      where: { OR: [{ userId }, { userId: null }], type: 'EXPENSE' },
      select: { name: true },
    });

    if (!this.model) {
      // Mock response when no API key
      return { categoryName: 'Khác', confidence: 50 };
    }

    try {
      const categoryList = categories.map((c) => c.name).join(', ');
      const prompt = `Hãy phân loại giao dịch sau vào 1 trong các danh mục: ${categoryList}.
Giao dịch: "${description}"
Chỉ trả về tên danh mục chính xác từ danh sách trên, không giải thích thêm.`;

      const result = await this.model.generateContent(prompt);
      const categoryName = result.response.text().trim();
      const found = categories.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
      );

      return {
        categoryName: found?.name || 'Khác',
        confidence: found ? 90 : 50,
      };
    } catch (error) {
      this.logger.error('AI categorization failed:', error);
      return { categoryName: 'Khác', confidence: 0 };
    }
  }

  // AI Financial Advisor Chatbot (Nâng cấp: phân tích sâu)
  async chat(userId: string, message: string): Promise<string> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Lấy ngữ cảnh tài chính đầy đủ
    const [wallets, recentTx, budgets, thisMonthTx, lastMonthTx, goals, chatHistory] =
      await Promise.all([
        this.prisma.wallet.findMany({
          where: { userId, isArchived: false },
          select: { name: true, balance: true, type: true },
        }),
        this.prisma.transaction.findMany({
          where: { userId },
          include: { category: true },
          orderBy: { date: 'desc' },
          take: 30,
        }),
        this.prisma.budget.findMany({
          where: { userId, isActive: true },
          include: { category: true },
        }),
        this.prisma.transaction.findMany({
          where: { userId, date: { gte: thisMonthStart } },
          select: { type: true, amount: true, category: { select: { name: true } } },
        }),
        this.prisma.transaction.findMany({
          where: { userId, date: { gte: lastMonthStart, lte: lastMonthEnd } },
          select: { type: true, amount: true },
        }),
        this.prisma.savingGoal.findMany({
          where: { userId, status: 'ACTIVE' },
          select: { name: true, targetAmount: true, currentAmount: true, deadline: true },
        }),
        this.prisma.chatMessage.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 6,
        }),
      ]);

    // Tính toán số liệu
    const totalBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);
    const thisMonthExpense = thisMonthTx
      .filter((t) => t.type === 'EXPENSE')
      .reduce((s, t) => s + Number(t.amount), 0);
    const thisMonthIncome = thisMonthTx
      .filter((t) => t.type === 'INCOME')
      .reduce((s, t) => s + Number(t.amount), 0);
    const lastMonthExpense = lastMonthTx
      .filter((t) => t.type === 'EXPENSE')
      .reduce((s, t) => s + Number(t.amount), 0);
    const expenseChange =
      lastMonthExpense > 0
        ? (((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100).toFixed(1)
        : 'N/A';

    // Top danh mục chi tiêu tháng này
    const categoryMap = new Map<string, number>();
    thisMonthTx
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        const cat = t.category?.name || 'Khác';
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + Number(t.amount));
      });
    const topCategories = [...categoryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, amt]) => `${name}: ${amt.toLocaleString('vi-VN')} VND`)
      .join(', ');

    // Ngân sách sắp vượt (>80%)
    const alertBudgets = budgets
      .filter((b) => Number(b.amount) > 0 && (Number(b.spent) / Number(b.amount)) >= 0.8)
      .map((b) => `${b.name}: ${Math.round((Number(b.spent) / Number(b.amount)) * 100)}%`)
      .join(', ');

    // Lịch sử chat (để giữ context hội thoại)
    const recentHistory = chatHistory
      .reverse()
      .map((m) => `[${m.role === 'user' ? 'Người dùng' : 'AI'}]: ${m.content.slice(0, 150)}`)
      .join('\n');

    // Lưu câu hỏi người dùng
    await this.prisma.chatMessage.create({
      data: { userId, role: 'user', content: message },
    });

    if (!this.model) {
      const mockResponse =
        `💰 Tổng số dư: ${totalBalance.toLocaleString('vi-VN')} VND | ` +
        `📊 Chi tháng này: ${thisMonthExpense.toLocaleString('vi-VN')} VND ` +
        `(${expenseChange !== 'N/A' ? (Number(expenseChange) > 0 ? '+' : '') + expenseChange + '% so tháng trước' : 'chưa có dữ liệu tháng trước'}).\n\n` +
        `Hãy cấu hình Gemini API key để tôi có thể tư vấn chi tiết hơn!`;
      await this.prisma.chatMessage.create({
        data: { userId, role: 'assistant', content: mockResponse },
      });
      return mockResponse;
    }

    try {
      const systemPrompt = `Bạn là AI Advisor tài chính cá nhân thông minh, thân thiện, chuyên nghiệp của FinWallet.
Bạn nói tiếng Việt, dùng emoji phù hợp, trả lời ngắn gọn súc tích (không quá 300 từ).
Bạn có khả năng phát hiện bất thường, đưa ra lời khuyên cụ thể dựa trên dữ liệu thực tế.

📊 DỮ LIỆU TÀI CHÍNH THỰC TẾ:
• Tổng số dư: ${totalBalance.toLocaleString('vi-VN')} VND
• Ví: ${wallets.map((w) => `${w.name}(${w.type}): ${Number(w.balance).toLocaleString('vi-VN')} VND`).join(' | ')}
• Thu tháng này: +${thisMonthIncome.toLocaleString('vi-VN')} VND
• Chi tháng này: -${thisMonthExpense.toLocaleString('vi-VN')} VND (${expenseChange !== 'N/A' ? (Number(expenseChange) > 0 ? '🔺+' : '🔻') + expenseChange + '% so tháng trước' : 'tháng đầu'})
• Top danh mục chi: ${topCategories || 'chưa có giao dịch'}
• Ngân sách cảnh báo (>80%): ${alertBudgets || 'không có'}
• Mục tiêu tiết kiệm: ${goals.map((g) => `${g.name}: ${Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100)}%`).join(', ') || 'chưa có'}
• 5 GD gần nhất: ${recentTx.slice(0, 5).map((t) => `${t.description || t.category?.name || '?'}: ${t.type === 'EXPENSE' ? '-' : '+'}${Number(t.amount).toLocaleString('vi-VN')}`).join(' | ')}

📝 LỊCH SỬ HỘI THOẠI GẦN ĐÂY:
${recentHistory || 'Đây là lần đầu trò chuyện.'}

QUY TẮC:
1. Nếu câu hỏi liên quan đến tài chính → dùng dữ liệu thực tế ở trên để trả lời
2. Nếu chi tiêu tháng này tăng >20% so tháng trước → CẢNH BÁO người dùng
3. Luôn đưa ra ≥1 lời khuyên cụ thể, có con số thực tế
4. Nếu câu hỏi không liên quan tài chính → nhẹ nhàng hướng về chủ đề tài chính

❓ Câu hỏi người dùng: ${message}`;

      const result = await this.model.generateContent(systemPrompt);
      const response = result.response.text();

      await this.prisma.chatMessage.create({
        data: { userId, role: 'assistant', content: response },
      });

      return response;
    } catch (error) {
      this.logger.error('AI chat failed:', error);
      return 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.';
    }
  }

  // Tổng hợp Financial Insights tháng hiện tại
  async getFinancialInsights(userId: string): Promise<{
    summary: string;
    alerts: string[];
    tips: string[];
    monthChange: number | null;
  }> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonthTx, lastMonthTx, budgets, wallets] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId, date: { gte: thisMonthStart } },
        include: { category: true },
      }),
      this.prisma.transaction.findMany({
        where: { userId, date: { gte: lastMonthStart, lte: lastMonthEnd } },
      }),
      this.prisma.budget.findMany({ where: { userId, isActive: true }, include: { category: true } }),
      this.prisma.wallet.findMany({ where: { userId, isArchived: false } }),
    ]);

    const thisExpense = thisMonthTx.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
    const lastExpense = lastMonthTx.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
    const thisIncome = thisMonthTx.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
    const totalBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);
    const monthChange = lastExpense > 0 ? Math.round(((thisExpense - lastExpense) / lastExpense) * 100) : null;

    const alerts: string[] = [];
    const tips: string[] = [];

    // Cảnh báo ngân sách
    budgets.forEach((b) => {
      const pct = Number(b.amount) > 0 ? (Number(b.spent) / Number(b.amount)) * 100 : 0;
      if (pct >= 100) alerts.push(`🚨 Đã vượt ngân sách "${b.name}" (${Math.round(pct)}%)`);
      else if (pct >= 80) alerts.push(`⚠️ Ngân sách "${b.name}" đã dùng ${Math.round(pct)}%`);
    });

    // Cảnh báo chi tiêu tăng đột biến
    if (monthChange !== null && monthChange > 30)
      alerts.push(`🔺 Chi tiêu tháng này tăng ${monthChange}% so tháng trước`);

    // Tips dựa trên dữ liệu
    if (thisIncome > 0 && thisExpense / thisIncome > 0.8)
      tips.push(`💡 Tỷ lệ chi/thu đang ở ${Math.round((thisExpense / thisIncome) * 100)}% — nên dưới 70%`);
    if (totalBalance < 0) tips.push('💡 Số dư âm — hãy xem lại các khoản chi lớn');
    if (tips.length === 0) tips.push('✅ Tài chính tháng này đang ổn định, tiếp tục duy trì!');

    const summary = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}: Thu ${thisIncome.toLocaleString('vi-VN')} VND | Chi ${thisExpense.toLocaleString('vi-VN')} VND | Số dư tổng ${totalBalance.toLocaleString('vi-VN')} VND`;

    return { summary, alerts, tips, monthChange };
  }

  // OCR Receipt Scanning — Tối ưu cho hóa đơn tiếng Việt
  async scanReceipt(
    imageBase64: string,
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  ): Promise<{
    amount?: number;
    description?: string;
    date?: string;
    category?: string;
    merchant?: string;
    rawText?: string;
  }> {
    // Fallback: thử trích xuất số tiền từ base64 metadata (nếu không có model)
    if (!this.model) {
      return {
        amount: 0,
        description: 'Hóa đơn (cần cấu hình AI)',
        date: new Date().toISOString().split('T')[0],
        category: 'Khác',
      };
    }

    try {
      const imagePart = { inlineData: { data: imageBase64, mimeType } };
      const prompt = `Bạn là chuyên gia OCR hóa đơn tiếng Việt.
Phân tích ảnh hóa đơn/biên lai này (có thể là hóa đơn in, chuyển khoản ngân hàng, bill nhà hàng, siêu thị).

Trả về ĐÚNG format JSON sau, không thêm text khác:
{
  "amount": <tổng số tiền cần thanh toán, chỉ số nguyên VND, không có dấu phẩy>,
  "description": "<mô tả ngắn gọn 1 dòng về giao dịch>",
  "date": "<YYYY-MM-DD, nếu không tìm thấy dùng ngày hôm nay>",
  "category": "<1 trong: Ăn uống/Đi lại/Mua sắm/Giải trí/Sức khỏe/Giáo dục/Hóa đơn/Khác>",
  "merchant": "<tên cửa hàng/ngân hàng nếu có, hoặc null>",
  "rawText": "<copy nguyên văn dòng tổng tiền từ hóa đơn nếu tìm thấy>"
}

Lưu ý quan trọng:
- Với hóa đơn VN: tìm "Tổng cộng", "Tổng tiền", "Thành tiền", "Total"
- Với bill ngân hàng: tìm "Số tiền", "Amount", "Giá trị GD"
- Bỏ qua dấu chấm/phẩy phân cách nghìn khi trả về amount
- Nếu có nhiều số tiền, lấy số TỔNG CUỐI CÙNG`;

      const result = await this.model.generateContent([prompt, imagePart]);
      const text = result.response.text().trim();

      // Thử parse JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/m);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Fallback regex nếu amount là string
        if (typeof parsed.amount === 'string') {
          const numMatch = parsed.amount.replace(/[.,]/g, '').match(/\d+/);
          parsed.amount = numMatch ? parseInt(numMatch[0]) : 0;
        }
        return parsed as { amount?: number; description?: string; date?: string; category?: string; merchant?: string; rawText?: string };
      }

      // Fallback: tìm số tiền bằng regex trong raw text
      const amountMatch = text.match(/([\d]{1,3}(?:[.,][\d]{3})+)/);
      const amount = amountMatch
        ? parseInt(amountMatch[1].replace(/[.,]/g, ''))
        : 0;
      return {
        amount,
        description: 'Hóa đơn (đọc thủ công)',
        date: new Date().toISOString().split('T')[0],
        category: 'Khác',
      };
    } catch (error) {
      this.logger.error('OCR failed:', error);
      return {
        amount: 0,
        description: 'Không đọc được hóa đơn',
        date: new Date().toISOString().split('T')[0],
      };
    }
  }

  // Parse QR Code Payload (VietQR or generic)
  async parseQR(
    qrData: string,
  ): Promise<{ amount?: number; description?: string }> {
    if (!this.model) {
      return { amount: 150000, description: 'Chuyển tiền quét QR (Mock)' };
    }
    try {
      const prompt = `Phân tích chuỗi dữ liệu mã QR này (thường là chuẩn EMVCo/VietQR) và tìm số tiền và nội dung. 
Chuỗi QR: "${qrData}"
Lưu ý: Nếu là VietQR, Tag 54 là số tiền, Tag 62 (với subtag 08) là nội dung. Nếu không có thì cố gắng trích xuất tên ngân hàng/người nhận vào description.
Trả về ĐÚNG 1 JSON duy nhất: {"amount": <số tiền hoặc 0>, "description": "<nội dung>"}. Không sinh thêm chữ.`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{.*\}/s);
      if (jsonMatch)
        return JSON.parse(jsonMatch[0]) as {
          amount?: number;
          description?: string;
        };
      return {};
    } catch (error) {
      this.logger.error('QR parsing failed:', error);
      return {};
    }
  }

  async getChatHistory(userId: string) {
    return this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
  }
}
