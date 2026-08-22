# Aura — Privacy-First Period Tracker PWA

A serene, lightweight, and strictly privacy-focused Period Tracker Progressive Web App (PWA) built for ~100 private users.

---

## 🔒 Privacy & Architecture Principles

- **Zero Third-Party Trackers**: No analytics trackers, ad networks, or invasive SDKs.
- **No AI / Heavy Backend**: Deterministic calculations, fast and lightweight.
- **Progressive Web App (PWA)**: Installable directly to mobile home screens with offline caching support.
- **Responsive Mobile-First UI**: Bottom tab navigation for mobile and top bar for desktop with a calm, discreet aesthetic.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (custom `blush`, `sage`, and `lavender` design palette)
- **Routing**: React Router v6 (`createBrowserRouter`)
- **Icons**: Lucide React
- **PWA**: `vite-plugin-pwa` with automatic service worker registration and manifest
- **Database/Auth Readiness**: Structure prepared for future Supabase client integration

---

## 🗺️ Route Inventory

### Public Pages
- `/` — **Landing Page**: Value proposition, privacy pillars, feature previews, CTAs.
- `/login` — **Login**: Form layout with password recovery and signup navigation.
- `/signup` — **Signup**: Registration form with privacy pledge confirmation.
- `/verify-email` — **Verify Email**: Verification notification with resend action.
- `/forgot-password` — **Forgot Password**: Password reset request form.
- `/reset-password` — **Reset Password**: New password configuration.

### Authenticated App Pages
- `/app/dashboard` — **Today / Dashboard**: Current cycle day indicator, phase badge, countdown to next period, daily check-in buttons.
- `/app/calendar` — **Calendar**: Month grid with color-coded period, fertile, and luteal phases.
- `/app/track` — **Track Period**: Multi-step log for flow intensity, mood, physical sensations, and private journal notes.
- `/app/history` — **History**: Past cycle timelines, duration stats, and symptom summaries.
- `/app/insights` — **Insights**: Cycle regularity metrics, frequent symptom frequency, and export preview.
- `/app/profile` — **Profile & Settings**: Passcode lock toggle, discreet mode toggle, and data export/wipe controls.

---

## 🚀 How to Run the Project

### 1. Install dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Build & Preview Production PWA
```bash
npm run build
npm run preview
```
