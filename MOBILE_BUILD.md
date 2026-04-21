# 📱 FinWallet — Hướng dẫn Build Mobile App (Capacitor)

## Yêu cầu

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| Android Studio | Giraffe+ |
| Java JDK | 17+ |
| Capacitor CLI | ≥ 6 |

---

## Kiến trúc

```
Next.js (Web) → next export → Capacitor → Android Studio → APK/AAB → Play Store
```

> ⚠️ **Lưu ý quan trọng**: Capacitor yêu cầu Next.js ở mode `output: 'export'` (static), khác với `output: 'standalone'` dùng cho Docker. Bạn cần tạo 2 config riêng.

---

## Bước 1: Cài đặt Capacitor

```bash
# Trong thư mục apps/web
cd apps/web

# Cài Capacitor
pnpm add @capacitor/core @capacitor/cli
pnpm add @capacitor/android @capacitor/ios

# Init Capacitor
npx cap init "FinWallet" "com.finwallet.app"
```

## Bước 2: Tạo next.config.mobile.js

```js
// apps/web/next.config.mobile.js
const config = {
  output: 'export',   // Static export cho Capacitor
  trailingSlash: true,
  images: { unoptimized: true }, // Cần thiết cho static export
};
export default config;
```

## Bước 3: Build Next.js (Static Export)

```bash
# Trong apps/web
NEXT_CONFIG_FILE=next.config.mobile.js pnpm build

# Hoặc thêm script vào package.json:
# "build:mobile": "NEXT_CONFIG_FILE=next.config.mobile.js next build"
```

Output sẽ ở thư mục `out/`

## Bước 4: Sync với Capacitor

```bash
# Sync code mới vào Android/iOS
npx cap sync android

# Nếu lần đầu
npx cap add android
npx cap add ios
```

## Bước 5: Mở Android Studio

```bash
npx cap open android
```

Trong Android Studio:
1. **Build** → **Generate Signed Bundle/APK**
2. Chọn **APK** (debug) hoặc **Android App Bundle** (release cho Play Store)
3. Create new keystore hoặc chọn keystore có sẵn
4. Chọn **release** build variant
5. Finish → APK sẽ ở `android/app/release/`

---

## Config đã tạo (capacitor.config.ts)

File `capacitor.config.ts` đã được tạo với:
- App ID: `com.finwallet.app`
- App Name: `FinWallet`
- Permissions: Camera (OCR), Push Notifications
- Dark status bar: `#06071A`

---

## Test trên thiết bị thật

```bash
# Kết nối Android qua USB → Enable USB Debugging
npx cap run android

# Hoặc dùng Live Reload trong development
npx cap run android --livereload --external
```

---

## Publish lên Google Play Store

1. Tạo **Android App Bundle (.aab)** thay vì APK
2. Đăng ký [Google Play Console](https://play.google.com/console)
3. Tạo app mới → Upload AAB → Điền thông tin → Submit review
4. Thường mất 1-3 ngày để được duyệt

---

## iOS Build (cần máy Mac)

```bash
npx cap open ios
# Mở Xcode → Product → Archive → Distribute App
```

> ℹ️ iOS build yêu cầu Apple Developer Account ($99/năm)
