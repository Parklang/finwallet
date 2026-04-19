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


