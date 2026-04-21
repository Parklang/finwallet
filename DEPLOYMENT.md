# 🚀 FinWallet — Hướng dẫn Triển khai Production

## Tổng quan kiến trúc

```
Internet → Nginx (HTTPS/SSL) → Next.js Web + NestJS API → PostgreSQL + Redis
```

Có 2 lựa chọn triển khai:
- **Option A**: Self-hosted (VPS) với Docker Compose
- **Option B**: PaaS (Railway API + Vercel Web) — Đơn giản hơn, khuyến nghị

---

## Option B: Railway + Vercel (Khuyến nghị)

### Bước 1: Chuẩn bị Database (Railway PostgreSQL)

1. Truy cập [railway.app](https://railway.app) → New Project → Provision PostgreSQL
2. Vào tab **Connect** → Copy **Connection String** (URI format)
3. Đây sẽ là `DATABASE_URL` của bạn

### Bước 2: Redis (Railway Redis)

1. Trong Project → New → Redis
2. Vào **Connect** → Copy `REDIS_URL`
3. Tách thành `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

### Bước 3: Deploy API lên Railway

```bash
# Cài Railway CLI
npm install -g @railway/cli

# Login
railway login

# Tạo service từ thư mục gốc
railway init          # Chọn "Empty Project"
railway up --service finwallet-api
```

**Variables cần set trong Railway Dashboard:**
```env
DATABASE_URL=postgresql://...     # Lấy từ Bước 1
REDIS_URL=redis://...             # Lấy từ Bước 2
JWT_SECRET=...                    # Random 64 chars
JWT_REFRESH_SECRET=...            # Random 64 chars
GEMINI_API_KEY=...
SMTP_USER=...
SMTP_PASS=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://your-api.railway.app/api/v1/auth/google/callback
FRONTEND_URL=https://your-app.vercel.app
```

### Bước 4: Deploy Web lên Vercel

```bash
# Cài Vercel CLI
npm install -g vercel

# Trỏ vào thư mục web
cd apps/web

# Deploy
vercel --prod
```

**Environment Variables trên Vercel:**
```env
NEXT_PUBLIC_API_URL=https://your-api.railway.app/api/v1
NEXT_PUBLIC_WS_URL=https://your-api.railway.app
```

### Bước 5: Google OAuth Setup

1. Truy cập [console.cloud.google.com](https://console.cloud.google.com)
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Application type: **Web application**
4. Authorized redirect URIs:
   ```
   https://your-api.railway.app/api/v1/auth/google/callback
   http://localhost:3001/api/v1/auth/google/callback  (dev)
   ```
5. Copy Client ID và Client Secret → Set trong Railway variables

---

## Option A: Self-hosted (VPS Docker)

### Yêu cầu
- Ubuntu 22.04+ với Docker + Docker Compose
- Domain trỏ về IP server
- Cổng 80, 443 mở

### Các bước

```bash
# 1. Clone và chuẩn bị env
git clone https://github.com/your-username/finwallet.git
cd finwallet
cp apps/api/.env.production.example .env.production
nano .env.production  # Điền thông tin thực

# 2. Khởi tạo SSL (lần đầu tiên)
chmod +x nginx/certbot-init.sh
./nginx/certbot-init.sh yourdomain.com admin@yourdomain.com

# 3. Sửa domain trong nginx config
sed -i 's/finwallet.yourdomain.com/yourdomain.com/g' nginx/nginx.prod.conf

# 4. Build và khởi động
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# 5. Xem logs
docker-compose -f docker-compose.prod.yml logs -f api
```

### Renew SSL tự động (Cron)

```bash
# Thêm vào crontab
0 0 1 * * docker run --rm -v $(pwd)/nginx/ssl:/etc/letsencrypt certbot/certbot renew && docker-compose -f docker-compose.prod.yml restart nginx
```

---

## GitHub Actions CI/CD

Thêm các **Secrets** sau vào GitHub Repository (Settings → Secrets):

| Secret | Giá trị |
|--------|---------|
| `DATABASE_URL` | PostgreSQL connection string production |
| `RAILWAY_TOKEN` | Lấy từ Railway → Account → API Tokens |
| `VERCEL_TOKEN` | Lấy từ Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Lấy từ `vercel env ls` |
| `VERCEL_PROJECT_ID` | Lấy từ `vercel env ls` |

Sau khi set xong, mỗi lần push lên `main` sẽ tự động:
1. 🧪 Chạy unit tests
2. 🗄️ Chạy `prisma migrate deploy`
3. 🚀 Deploy API lên Railway
4. 🚀 Deploy Web lên Vercel

---

## Kiểm tra sau Deploy

```bash
# Health check API
curl https://your-api.railway.app/api/v1/health

# Swagger docs
open https://your-api.railway.app/api/docs

# Test 2FA
curl -X POST https://your-api.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```
