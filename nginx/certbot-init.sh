#!/bin/bash
# ============================================================
# FinWallet — Certbot SSL Init Script
# Chạy lần đầu để lấy SSL certificate từ Let's Encrypt
# ============================================================
# CÁCH DÙNG:
#   chmod +x nginx/certbot-init.sh
#   ./nginx/certbot-init.sh yourdomain.com your@email.com
# ============================================================

DOMAIN=${1:-finwallet.yourdomain.com}
EMAIL=${2:-admin@yourdomain.com}

echo "🔐 Khởi tạo SSL cho domain: $DOMAIN"
echo "📧 Email: $EMAIL"

# Tạo thư mục SSL
mkdir -p ./nginx/ssl

# Chạy certbot trong Docker
docker run --rm \
  -v "$(pwd)/nginx/ssl:/etc/letsencrypt" \
  -v "$(pwd)/nginx/certbot:/var/www/certbot" \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

echo "✅ SSL certificate đã được tạo!"
echo "📁 Certificates tại: ./nginx/ssl/live/$DOMAIN/"
echo ""
echo "⚙️  BƯỚC TIẾP THEO:"
echo "1. Sửa nginx/nginx.prod.conf — thay 'finwallet.yourdomain.com' thành '$DOMAIN'"
echo "2. docker-compose -f docker-compose.prod.yml up -d nginx"
