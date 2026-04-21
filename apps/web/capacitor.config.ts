// ============================================================
// Capacitor Config — Native App Build (PWA → Android/iOS)
// Section: App Conversion
// ============================================================
// CÁCH BUILD APK:
//   1. pnpm --filter web build         (build Next.js)
//   2. npx cap sync android            (sync với Capacitor)
//   3. npx cap open android            (mở Android Studio)
//   4. Build > Generate Signed Bundle/APK
// ============================================================
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finwallet.app',
  appName: 'FinWallet',
  webDir: 'out', // Next.js static export output (dùng output: 'export')
  server: {
    // Trong development, trỏ tới local Next.js
    // Xóa block này khi build production APK
    url: 'http://192.168.1.x:3000', // Thay bằng IP máy của bạn
    cleartext: true,
  },
  android: {
    buildOptions: {
      releaseType: 'APK',
    },
  },
  ios: {
    contentInset: 'always',
  },
  plugins: {
    // Push Notifications
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    // Camera (cho OCR scanning)
    Camera: {
      permissions: ['camera', 'photos'],
    },
    // Status Bar
    StatusBar: {
      style: 'dark',
      backgroundColor: '#06071A',
    },
  },
};

export default config;
