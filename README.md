<div align="center">
  <img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/0091950f-20f7-419c-b5e6-77875483d397" alt="FinWallet Logo" width="80" height="80">
  
  # 💰 FinWallet — Smart Personal Finance Tracker
  
  **Dự án Quản lý Tài chính Cá nhân Toàn diện (Production v1.0)**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat&logo=nestjs)](https://nestjs.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://postgresql.org/)
  [![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-ED4C5C?style=flat)](https://turbo.build/)
  [![Gemini AI](https://img.shields.io/badge/Google%20AI-Gemini%202.5-4285F4?style=flat&logo=google)](https://ai.google.dev/)
  
  🚀 **Live Frontend:** [https://finwallet-web.vercel.app](https://finwallet-web.vercel.app) | 🔌 **Live API:** [https://finwallet-api.onrender.com/api/v1](https://finwallet-api.onrender.com/api/v1)
</div>

---

## 🎯 Giới thiệu
**FinWallet** là một ứng dụng quản lý thu chi cá nhân hiện đại, được xây dựng theo kiến trúc **Monorepo** với các công nghệ Web mới nhất. Dự án không chỉ giúp người dùng theo dõi dòng tiền (Double-entry ledger), lập ngân sách, mà còn tích hợp Trí tuệ Nhân tạo (Google Gemini) để cung cấp các phân tích tài chính tự động và chuyên sâu.

> *Lưu ý: Bạn có thể thay thế các ảnh mockup dưới đây bằng ảnh chụp màn hình thực tế của ứng dụng để làm portfolio.*

<div align="center">
  <!-- Thay thế đường dẫn link ảnh thực tế của bạn vào đây -->
  <img src="https://via.placeholder.com/800x450.png?text=Dashboard+Screenshot" alt="FinWallet Dashboard" width="800" />
</div>

---

## ✨ Tính năng Nổi bật (Core Features)

1. **💹 Quản lý Sổ cái Cốt lõi (Ledger System):** 
   - Quản lý nhiều ví (Cash, Bank, Credit Card). 
   - Ghi nhận giao dịch Thu/Chi/Chuyển khoản chính xác tuyệt đối.
2. **🎯 Ngân sách & Mục tiêu (Budgets & Goals):** 
   - Đặt ngân sách hàng tháng cho từng danh mục. 
   - Cảnh báo tự động khi chi tiêu vượt mốc 80% hoặc 100%.
3. **🤖 AI Advisor & OCR (Tích hợp Trí tuệ Nhân tạo):** 
   - Tự động đọc và quét hóa đơn (Receipt Scanner) bằng Gemini OCR.
   - Trợ lý ảo tư vấn tài chính, phân tích thói quen tiêu dùng dựa trên dữ liệu thật.
4. **👥 Tính tiền hội nhóm (Bill Splitting):** 
   - Mời bạn bè, chia tiền nhanh chóng sau các buổi tiệc hoặc chuyến đi chơi.
5. **🔔 Thông báo Real-time:** 
   - Cập nhật số dư và cảnh báo tức thì thông qua WebSockets (Socket.io).

---

## 🏗️ Kiến trúc Công nghệ (Tech Stack)

Dự án được ứng dụng **14 lớp công nghệ chuẩn Doanh nghiệp**, phân tách rõ ràng giữa Frontend và Backend.

| Thành phần | Lựa chọn Công nghệ | Lý do giải thích (Why?) |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15, React 19, Tailwind CSS | Tối ưu hóa SEO (SSR/SSG), render giao diện nhanh, styling utility-first linh hoạt. |
| **Backend** | NestJS 11 (Node.js) | Kiến trúc Module hóa chặt chẽ, Dependency Injection mạnh mẽ (theo phong cách OOP). |
| **Database** | PostgreSQL + Prisma ORM | RDBMS đảm bảo tính toàn vẹn dữ liệu tài chính (ACID). Prisma giúp Type-safe tuyệt đối. |
| **Architecture**| Turborepo (Monorepo) | Quản lý chung mã nguồn, chia sẻ Types an toàn giữa Front và Back, build cache siêu tốc. |
| **State Mgt** | Zustand | Nhẹ, dễ dùng hơn Redux, hạn chế re-render dư thừa ở Client. |
| **Security** | JWT (Access/Refresh), Bcrypt | Đảm bảo xác thực không trạng thái (stateless), mã hóa mật khẩu an toàn. |
| **AI/Integrations**| Google Gemini 2.5 Flash | Khả năng xử lý ngôn ngữ tự nhiên tiếng Việt tốt, OCR ảnh biên lai mượt mà và miễn phí. |
| **Realtime** | Socket.io | Kết nối hai chiều với độ trễ tối thiểu để bắn thông báo. |
| **Deploy** | Vercel (Web), Render (API) | Giải pháp Cloud CI/CD tự động, tối ưu chi phí cho các Serverless và Backend API. |

### 📂 Cấu trúc Thư mục

```text
finwallet/
├── apps/
│   ├── web/      # [Next.js] Giao diện người dùng
│   └── api/      # [NestJS] Máy chủ xử lý logic
├── packages/     # [Tương lai] Thư viện dùng chung (UI, config)
├── package.json  # Khai báo pnpm workspaces
└── turbo.json    # Cấu hình Turborepo Build Pipelines
```

---

## ⚙️ Hướng dẫn Cài đặt & Chạy Local

Bạn cần cài đặt **[Node.js 18+](https://nodejs.org/en/)**, **[pnpm](https://pnpm.io/)** và một Database **PostgreSQL**.

**1. Clone mã nguồn**
```bash
git clone https://github.com/Parklang/finwallet.git
cd finwallet
```

**2. Cài đặt thư viện**
```bash
pnpm install
```

**3. Cấu hình Biến môi trường**
Tạo file `.env` bên trong thư mục `apps/api/` (Tham khảo `apps/api/.env.example`) và điền các thông tin:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/finwallet"
JWT_SECRET="super_secret_key"
JWT_REFRESH_SECRET="super_secret_refresh_key"
GEMINI_API_KEY="your-gemini-key"
```

**4. Khởi tạo Database**
```bash
cd apps/api
npx prisma db push
```

**5. Khởi động toàn bộ dự án**
Quay lại thư mục gốc (`/finwallet`) và chạy lệnh của Turborepo:
```bash
pnpm run dev
```
- Frontend sẽ chạy ở: `http://localhost:3000`
- Backend API sẽ chạy ở: `http://localhost:4000/api/v1`
- Swagger API Docs: `http://localhost:4000/api/docs`

---

## 🗄️ Database & Schema Design

Hệ thống được thiết kế theo tư duy **Double-entry bookkeeping** đơn giản hóa cho cá nhân.

- `User`: Quản lý thông tin xác thực, ngôn ngữ, quyền.
- `Wallet`: Lưu số dư hiện tại của từng nguồn tiền.
- `Transaction`: Giao dịch cốt lõi (Tham chiếu tới ví nguồn và ví đích nếu là chuyển khoản).
- `Category`: Phân loại thu chi (Hỗ trợ cha/con).
- `ChatMessage`: Lưu trữ ngữ cảnh cuộc trò chuyện giữa người dùng và AI.

*(Bạn có thể chạy `npx prisma studio` để vào giao diện quản lý Database trực quan trên trình duyệt)*.

---

## 🚀 Quy trình Triển khai (CI/CD Deployment)

Dự án có thể chạy hoàn toàn độc lập trên môi trường Cloud:
1. **Database:** Lưu trữ tại [Supabase](https://supabase.com/) (Session mode, port 5432).
2. **API (Backend):** Triển khai trực tiếp từ kho lưu trữ GitHub sang [Render.com](https://render.com/). Build command tự động chạy `prisma generate` và `nest build`.
3. **Web (Frontend):** Ứng dụng công nghệ Edge Network của [Vercel](https://vercel.com/), hỗ trợ pre-rendering tĩnh và API Routes nội bộ siêu nhanh.

---
*Dự án tâm huyết được phát triển bởi **Parklang** .*
