# 💰 FinWallet (npj) — Smart Personal Finance Tracker

> **Dự án đang trong quá trình phát triển (Development / Alpha Version)**. Mục tiêu là xây dựng một hệ thống quản lý tài chính cá nhân toàn diện, tích hợp AI để tối ưu hóa trải nghiệm người dùng.

---

## 🛠 Bản đồ Công nghệ (14-Point Tech Stack)

Dưới đây là chi tiết các lớp công nghệ đang được sử dụng và lộ trình phát triển của từng phần.

| Lớp (Layer) | Công nghệ & Chi tiết | Trạng thái |
| :--- | :--- | :---: |
| **1. Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS, Zustand | `[DONE]` |
| **2. Backend** | NestJS 11 (Node.js framework), REST APIs | `[DONE]` |
| **3. Architecture** | Monorepo (Turborepo), Modular Architecture, Pnpm Workspaces | `[DONE]` |
| **4. Database** | PostgreSQL Core, Prisma ORM | `[DONE]` |
| **5. Auth & Security** | JWT Authentication, Bcrypt password hashing, Audit Logs | `[WIP]` |
| **6. Infrastructure** | Turborepo Pipeline, Local Deployment | `[DONE]` |
| **7. DevOps** | Docker Compose, Swagger (API Docs), GitHub Actions | `[DONE]` |
| **8. Integrations** | Gemini AI, Cloudinary Service, Nodemailer | `[WIP]` |
| **9. Core Modules** | Wallet, Transaction, Category, Budget, Goal, Bill Split | `[DONE]` |
| **10. Analytics** | Recharts Visualization, Revenue/Expense Logic | `[DONE]` |
| **11. Notifications** | Real-time WebSocket (Socket.io) | `[DONE]` |
| **12. AI Features** | Gemini Advisor, OCR Receipt Parsing, QR Support | `[WIP]` |
| **13. Testing** | Jest Unit/Integration Testing (Partial) | `[WIP]` |
| **14. Performance** | Turborepo Local/Remote Caching | `[DONE]` |

---

## 🗺️ Hệ sinh thái Dự án (Technical Tree)

```text
FinWallet Tech Ecosystem
┃
┣ 📂 Frontend(Web)
┃ ┣ 📂 Next.js 15 & React 19
┃ ┣ 📂 TailwindCSS (UI Styling)
┃ ┣ 📂 Zustand (State Management)
┃ ┗ 📂 Framer Motion (Animations)
┃
┣ 📂 Backend(API)
┃ ┣ 📂 NestJS (Modular Architecture)
┃ ┣ 📂 Socket.io (Real-time syncing)
┃ ┗ 📂 Swagger (Doc generation)
┃
┣ 📂 Data Layer
┃ ┣ 📂 PostgreSQL (Primary DB)
┃ ┣ 📂 Prisma (Type-safe ORM)
┃ ┗ 📂 Redis (Caching / Queue - [Roadmap])
┃
┣ 📂 Security
┃ ┣ 📂 JWT Stateless Auth
┃ ┣ 📂 Audit Log System
┃ ┣ 📂 Rate Limiting (Throttler)
┃ ┗ 📂 OAuth 2.0 (Google/FB - [Roadmap])
┃
┣ 📂 Integrations
┃ ┣ 📂 Gemini AI (Advisory & OCR)
┃ ┣ 📂 Cloudinary (Media upload)
┃ ┣ 📂 Nodemailer (Mail trigger)
┃ ┗ 📂 Payment Gateway (PayOS/Stripe - [Roadmap])
┃
┣ 📂 Core Modules
┃ ┣ 📂 Wallets & Transactions
┃ ┣ 📂 Budgeting & Savings Goals
┃ ┣ 📂 Group Bill Splitting
┃ ┗ 📂 Recurring Payments ([WIP])
┃
┗ 📂 DevOps & Performance
  ┣ 📂 Docker Compose setup
  ┣ 📂 GitHub Actions (CI)
  ┗ 📂 Turbo Performance Caching
```

---

## 🚀 Lộ trình Phát triển (Roadmap & Missing Features)

Hiện tại, dự án đã hoàn thiện khung sườn (Foundation) và các tính năng quản lý cốt lõi. Các phần tiếp theo đang được ưu tiên phát triển bao gồm:

### 1. Cổng thanh toán (Payment Integrations) `[High Priority]`
- Tích hợp chuẩn **VietQR** để quét mã chuyển tiền nhanh.
- Kết nối SDK **PayOS** hoặc **Stripe** để xử lý các giao dịch nạp/rút thực tế.

### 2. Bảo mật & Xác thực nâng cao `[WIP]`
- Bổ sung **Xác thực 2 lớp (2FA)** qua Email/SMS.
- Chức năng **Social Login** (Đăng nhập bằng Google, Github).

### 3. Hiệu năng & Khả năng mở rộng `[Roadmap]`
- Triển khai **Redis** để lưu trữ cache và hàng đợi (Queue - BullMQ) giúp tối ưu hóa việc gửi thông báo/email.
- Hỗ trợ đa ngôn ngữ (**i18n**) và đa tiền tệ.

### 4. Tính năng AI nâng cao `[WIP]`
- Cải thiện độ chính xác của **OCR quét hóa đơn**.
- AI phân tích và dự báo chi tiêu dựa trên lịch sử giao dịch dài hạn.

---

## 🛠 Hướng dẫn Cài đặt & Chạy local

1. **Cài đặt Dependency**: `pnpm install`
2. **Cấu hình**: Tạo file `.env` mẫu tại `apps/api` và `.env.local` tại `apps/web`.
3. **Database**: `cd apps/api && npx prisma migrate dev`
4. **Run Dev**: 
   - Root: `pnpm dev`
   - Mobile Test (bind IP): `pnpm dev:mobile`

---
*Dự án đang trong quá trình hoàn thiện, mọi đóng góp hoặc phát hiện lỗi xin vui lòng tạo Issue trên GitHub.*
