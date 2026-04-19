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
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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

  // AI Financial Advisor Chatbot
  async chat(userId: string, message: string): Promise<string> {
    // Get user financial context
    const [wallets, recentTx, budgets] = await Promise.all([
      this.prisma.wallet.findMany({
        where: { userId, isArchived: false },
        select: { name: true, balance: true },
      }),
      this.prisma.transaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { date: 'desc' },
        take: 20,
      }),
      this.prisma.budget.findMany({
        where: { userId, isActive: true },
        include: { category: true },
      }),
    ]);

    // Save user message
    await this.prisma.chatMessage.create({
      data: { userId, role: 'user', content: message },
    });

    if (!this.model) {
      const mockResponse = `Tôi là AI Advisor của FinWallet. Hiện tại bạn có ${wallets.length} ví với tổng số dư: ${wallets.reduce((s, w) => s + Number(w.balance), 0).toLocaleString('vi-VN')} VND. Hãy cấu hình Gemini API key để sử dụng tư vấn thông minh!`;
      await this.prisma.chatMessage.create({
        data: { userId, role: 'assistant', content: mockResponse },
      });
      return mockResponse;
    }

    try {
      const context = `
Bạn là AI Advisor tài chính cá nhân thông minh cho app FinWallet.

DỮ LIỆU TÀI CHÍNH NGƯỜI DÙNG:
Ví hiện tại: ${wallets.map((w) => `${w.name}: ${Number(w.balance).toLocaleString('vi-VN')} VND`).join(', ')}
Ngân sách: ${budgets.map((b) => `${b.category?.name || b.name}: đã chi ${Number(b.spent).toLocaleString('vi-VN')}/${Number(b.amount).toLocaleString('vi-VN')} VND`).join(', ')}
Giao dịch gần đây (10 GD mới nhất): ${recentTx
          .slice(0, 10)
          .map(
            (t) =>
              `${t.description || 'Không tên'} - ${t.type === 'EXPENSE' ? '-' : '+'}${Number(t.amount).toLocaleString('vi-VN')} VND`,
          )
          .join('; ')}

Hãy tư vấn tài chính bằng tiếng Việt, ngắn gọn, thực tế, thân thiện.
Câu hỏi của người dùng: ${message}`;

      const result = await this.model.generateContent(context);
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

  // OCR Receipt Scanning with Gemini Vision
  async scanReceipt(imageBase64: string): Promise<{
    amount?: number;
    description?: string;
    date?: string;
    category?: string;
  }> {
    if (!this.model) {
      return {
        amount: 0,
        description: 'Hóa đơn',
        date: new Date().toISOString().split('T')[0],
      };
    }

    try {
      const imagePart = {
        inlineData: { data: imageBase64, mimeType: 'image/jpeg' },
      };
      const prompt = `Phân tích ảnh hóa đơn này và trả về JSON với format:
{"amount": <số tiền>, "description": "<mô tả ngắn>", "date": "<YYYY-MM-DD>", "category": "<loại: Ăn uống/Đi lại/Mua sắm/...>"}
Chỉ trả về pure JSON, không có text khác.`;

      const result = await this.model.generateContent([prompt, imagePart]);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{.*\}/s);
      if (jsonMatch)
        return JSON.parse(jsonMatch[0]) as {
          amount?: number;
          description?: string;
          date?: string;
          category?: string;
        };
      return {};
    } catch (error) {
      this.logger.error('OCR failed:', error);
      return {};
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
