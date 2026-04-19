# 💰 FinWallet — Quản lý Tài chính Thông minh với AI

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11+-red?logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?logo=prisma)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-black?logo=socket.io)](https://socket.io/)
[![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-blue?logo=google-gemini)](https://ai.google.dev/)

**FinWallet** là một nền tảng quản lý tài chính cá nhân hiện đại, kết hợp sức mạnh của trí tuệ nhân tạo (AI) để giúp bạn theo dõi, phân tích và tối ưu hóa tài chính của mình một cách dễ dàng và hiệu quả nhất.

---

## ✨ Tính năng nổi bật

### 🤖 Cố vấn tài chính AI (AI Advisor)
Sử dụng công nghệ **Google Gemini AI** để phân tích thói quen tiêu dùng, dự báo xu hướng và đưa ra lời khuyên tài chính cá nhân hóa cho từng người dùng.

### 🔔 Thông báo thời gian thực (Real-time)
Hệ thống thông báo tức thì qua **Socket.io** giúp bạn cập nhật mọi biến động số dư, nhắc nhở ngân sách và các mục tiêu tài chính ngay khi chúng xảy ra.

### 📊 Báo cáo biểu đồ trực quan
Theo dõi sức khỏe tài chính thông qua các biểu đồ **Recharts** sinh động. Hiểu rõ dòng tiền của bạn đi đâu và đến từ đâu chỉ trong vài giây.

### 💸 Chia tiền thông minh (Bill Splitting)
Tính năng chia tiền nhóm giúp giải quyết các hóa đơn chung một cách minh bạch, công bằng và nhanh chóng.

### 📅 Quản lý ngân sách & Mục tiêu
- Thiết lập hạn mức chi tiêu cho từng hạng mục.
- Theo dõi tiến độ tiết kiệm cho các mục tiêu lớn (Mua nhà, xe, du lịch...).
- Tự động hóa các khoản thu/chi định kỳ (Recurring transactions).

---

## 🛠 Bộ công nghệ (Tech Stack)

### **Frontend**
- **Next.js 15+ (App Router)** & **React 19**
- **Tailwind CSS** (Styling) & **Framer Motion** (Animations)
- **Zustand** (State Management)
- **Radix UI** & **Lucide Icons**

### **Backend**
- **NestJS 11** (Framework)
- **Prisma ORM** (Database management)
- **Socket.io** (Real-time communications)
- **JWT** (Security & Authentication)

### **Database & Infrastructure**
- **PostgreSQL** (Main Database)
- **Google Gemini API** (AI Processing)
- **Cloudinary** (Image Storage)
- **Turborepo** (Monorepo Management)

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Yêu cầu hệ thống
- **Node.js** >= 18
- **pnpm** (Khuyên dùng) hoặc **npm / yarn**

### 2. Cài đặt các gói phụ thuộc
Tại thư mục gốc của dự án, chạy lệnh:
```bash
pnpm install
```

### 3. Cấu hình biến môi trường
Tạo các file `.env` mẫu dựa trên cấu hình:
- **API (.env)**: `apps/api/.env` (Cần DATABASE_URL, GEMINI_API_KEY, JWT_SECRET,...)
- **Web (.env.local)**: `apps/web/.env.local` (Cần NEXT_PUBLIC_API_URL,...)

### 4. Khởi tạo Database
```bash
cd apps/api
npx prisma migrate dev
```

### 5. Chạy dự án ở chế độ Development
Quay lại thư mục gốc và chạy:
```bash
pnpm dev
```
- Frontend sẽ chạy tại: `http://localhost:3000`
- Backend sẽ chạy tại: `http://localhost:3001`

### 📱 Demo trên thiết bị di động
Để chạy ứng dụng và test trên điện thoại cùng mạng Wi-Fi:
```bash
pnpm dev:mobile
```
(Xem chi tiết hướng dẫn IP tại [Walkthrough](file:///c:/Users/Admin/.gemini/antigravity/brain/8bd627fb-04db-4c58-a3a2-e7648ce98bd4/walkthrough.md))

---

## 📂 Thu mục dự án (Monorepo Structure)

```text
├── apps
│   ├── web          # Ứng dụng Next.js (Frontend)
│   ├── api          # API NestJS (Backend)
│   └── docs         # Tài liệu dự án
├── packages
│   ├── ui           # Thư viện component dùng chung
│   ├── typescript-config
│   └── eslint-config
└── turbo.json       # Cấu hình Turborepo
```

---

## 📄 Giấy phép (License)
Dự án được phát hành dưới giấy phép MIT. Xem chi tiết tại file [LICENSE](LICENSE).

---

⭐ **Đừng quên nhấn Star nếu bạn yêu thích dự án này!**
