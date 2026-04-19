# 💰 FinWallet — Quản lý Tài chính Thông minh với AI

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11+-red?logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?logo=prisma)](https://www.prisma.io/)
[![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-blue?logo=google-gemini)](https://ai.google.dev/)

**FinWallet** là nền tảng quản lý tài chính cá nhân hiện đại, kết hợp sức mạnh của trí tuệ nhân tạo (AI) để tối ưu hóa sức khỏe tài chính cho người dùng.

---

## 🛠 Bản đồ công nghệ (Technical Ecosystem)

Dưới đây là cấu trúc 14 lớp công nghệ chính cấu thành nên hệ sinh thái của FinWallet:

| Lớp (Layer) | Công nghệ & Chi tiết | Trạng thái |
| :--- | :--- | :---: |
| **1. Frontend** | Next.js 15+ (App Router), React 19, Tailwind CSS, Framer Motion | ✅ |
| **2. Backend** | NestJS 11 (Node.js framework), RxJS | ✅ |
| **3. Architecture** | Monorepo (Turborepo), Modular Architecture, Pnpm Workspaces | ✅ |
| **4. Database** | PostgreSQL, Prisma ORM (Type-safe querying) | ✅ |
| **5. Auth & Security** | JWT (Stateless), Bcrypt, Throttler (Rate Limit), Audit Logging System | ✅ |
| **6. Infrastructure** | Turborepo pipeline, Monorepo build system | ✅ |
| **7. DevOps** | Docker Compose, Swagger (API Docs), Health Checks, GitHub Actions | ✅ |
| **8. Integrations** | Google Gemini AI, Cloudinary (Media), Nodemailer, PayOS/VietQR (Planned) | ✅ |
| **9. Core Modules** | Wallet, Transaction, Category, Budget, Goal, Bill Split, Recurring | ✅ |
| **10. Analytics** | Analytics Service, Recharts (Visual Data Presentation) | ✅ |
| **11. Notifications** | Real-time WebSocket (Socket.io) | ✅ |
| **12. AI Features** | AI Financial Advisor, OCR Receipt Scanning, Smart QR Parsing | ✅ |
| **13. Testing** | Jest (Unit/Integration Testing), Type-safe checking | ✅ |
| **14. Scalability** | Turborepo Remote Caching, Optimized DB queries | ✅ |

---

## ✨ Tính năng nổi bật

- **Robot tư vấn AI**: Tư vấn tài chính cá nhân hóa bằng Google Gemini.
- **Quản lý đa ví**: Theo dõi số dư từ nhiều nguồn tài khoản khác nhau.
- **Thông báo tức thì**: Cập nhật biến động số dư và nhắc nhở qua WebSocket.
- **Quét hóa đơn thông minh**: Tự động trích xuất thông tin từ ảnh chụp hóa đơn bằng AI.
- **Phân tích chi tiêu**: Biểu đồ trực quan giúp bạn nắm bắt dòng tiền nhanh chóng.

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Cài đặt các gói phụ thuộc
```bash
pnpm install
```

### 2. Cấu hình biến môi trường
Sao chép `.env.example` thành `.env` trong các thư mục `apps/api` và `apps/web`.

### 3. Khởi chạy dự án
```bash
pnpm dev
```
- Frontend: `http://localhost:3000`
- Backend/Swagger: `http://localhost:3001/api/docs`

### 📱 Demo trên di động
Chạy lệnh sau để kết nối điện thoại cùng mạng Wi-Fi:
```bash
pnpm dev:mobile
```

---

## 📄 Giấy phép (License)
Dự án được bảo hộ dưới giấy phép MIT.

---

⭐ **Ủng hộ dự án bằng cách nhấn Star trên GitHub!**
