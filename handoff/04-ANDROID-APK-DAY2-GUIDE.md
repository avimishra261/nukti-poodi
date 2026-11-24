# 04 — Day 2 Android App (Capacitor APK) Guide

Because Nukti Poodi is built as a clean, responsive Next.js PWA, wrapping it into a native Android APK takes **under 1 hour** using **Capacitor** without rewriting a single UI screen.

---

## 1. Capacitor Setup Commands
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Nukti Poodi" "in.nuktipoodi.app" --web-dir=out
```

Point `capacitor.config.ts` directly to your live Vercel production URL (for instant live updates + real-time API) OR bundle static `out/`:
```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.nuktipoodi.app',
  appName: 'Nukti Poodi',
  webDir: 'out',
  server: {
    url: 'https://YOUR-VERCEL-URL.vercel.app',
    cleartext: false,
  },
};

export default config;
```

Then build the Android project and debug APK:
```bash
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```
Output APK: `android/app/build/outputs/apk/debug/app-debug.apk` — ready to share directly on Indore WhatsApp groups!

---

## 2. Native Enhancements for Day 2
1. **Native GPS (`@capacitor/geolocation`):** Instant location lock without browser permission prompts.
2. **Push Notifications (`@capacitor/push-notifications` + Firebase FCM):** Notify users within 3 km when a new Verified Bhandara goes live.
3. **Native Share Sheet (`@capacitor/share`):** Opens Android's native share drawer with WhatsApp/Instagram/Telegram.

---

## 3. Google Play Store Rules Reminder
- One-time developer fee: **\$25 (~₹2,100)**.
- New personal Play Console accounts require **12 opted-in testers for 14 continuous days** of closed testing before Production release.
- Until Play Store approval completes, users can install via **PWA ("Add to Home Screen")** or **direct APK download**.
