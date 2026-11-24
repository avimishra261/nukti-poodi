# 01 — Nukti Poodi Architecture (High Cohesion & Low Coupling)

## 1. Design Philosophy
Nukti Poodi follows a **clean layered architecture** designed for fast iteration, zero vendor lock-in, and dual deployment (Serverless Vercel + Static GitHub Pages PWA + upcoming Capacitor Android APK).

Every file in `src/` has a single, clear responsibility:

```
src/
├── app/                         # Next.js App Router (Routes & API Endpoints)
│   ├── page.tsx                 # Thin composition shell for Home
│   ├── add/page.tsx             # Bhandara creation flow
│   ├── admin/page.tsx           # Moderation dashboard
│   ├── about/page.tsx           # Mission, PWA install guide & Disclaimer
│   ├── bhandara/[id]/page.tsx   # SSR OpenGraph metadata + static params
│   └── api/bhandaras/           # Server REST endpoints (GET/POST/PATCH/DELETE/vote)
│
├── components/                  # Focused, presentational & interactive UI modules
│   ├── Navbar.tsx               # Header, GPS status, PWA install, Login trigger
│   ├── HeroBanner.tsx           # Indore radar banner, hotspot pills, live stats
│   ├── FilterToolbar.tsx        # Status tabs with counts, search, area, food, sort, view toggle
│   ├── BhandaraCard.tsx         # Card UI with trust bar, distance, quick actions
│   ├── BhandaraMap.tsx          # Interactive Leaflet + OSM map (SSR disabled)
│   ├── LocationPickerMap.tsx    # Pin-drop mini-map for /add & /bhandara/[id]
│   ├── BhandaraDetailClient.tsx # Detail view orchestrator + owner controls + link copy
│   ├── CommunityTrustWidget.tsx # Isolated trust score bar, 3-way voting & crowd meter
│   ├── AnnadaanSevaBanner.tsx   # Zero food waste & Roti Bank awareness banner
│   ├── LoginModal.tsx           # 1-Tap Indore Bhakt Login
│   └── PwaRegistrar.tsx         # Service Worker registration
│
└── lib/                         # Pure domain logic, utilities, and data adapters
    ├── types.ts                 # Shared TypeScript interfaces
    ├── indore-areas.ts          # 25 Indore localities with lat/lng + food presets
    ├── seed-data.ts             # 16 Indore seed bhandaras + rolling timestamp normalizer
    ├── db.ts                    # Server persistence adapter (Cloud Gist DB + /tmp fallback)
    ├── client-api.ts            # Isomorphic client transport (API -> Gist -> localStorage)
    ├── geo.ts                   # Clean barrel re-exporting utils/*
    ├── utils/
    │   ├── geo.ts               # Haversine distance & Google Maps deep links
    │   ├── time.ts              # IST formatting & live/upcoming/ended status logic
    │   ├── share.ts             # WhatsApp share text, trust %, cross-phone URL codec
    │   └── image.ts             # Client-side canvas photo compression (~70KB JPEG)
    └── services/
        ├── auth-storage.ts      # Decoupled client session & vote history storage
        └── bhandara-filter.ts   # Pure filtering, sorting, and live stats computation
```

---

## 2. Dependency Rules (Low Coupling)
- **`utils/*`** depend only on `types.ts` (zero React, zero DOM except `utils/image.ts`, zero network).
- **`services/bhandara-filter.ts`** depends only on `types.ts` and `utils/*` — completely unit-testable in isolation.
- **`services/auth-storage.ts`** owns `localStorage` session and vote tracking; UI components never touch raw `localStorage` keys directly.
- **`client-api.ts`** handles data transport and fallback; UI pages never hardcode `fetch('/api/...')` or Gist URLs.
- **UI Components** receive typed props and callbacks, making them reusable across Web and Capacitor Android builds.

---

## 3. Multi-Tier Persistence Architecture
1. **Vercel Production (Default Server Mode)**:
   - UI calls `/api/bhandaras/*` -> Server `db.ts` reads/writes the **Cloud GitHub Gist DB** (`GITHUB_DB_GIST_ID`) authenticated with `GITHUB_DB_TOKEN` + in-memory & `/tmp` read cache.
   - All users across Indore share the same live database in real time!
2. **Supabase Upgrade Path (Optional)**:
   - Complete Postgres + RLS + triggers schema is ready in `supabase/schema.sql`.
3. **Static / Offline Fallback**:
   - When `/api` is unreachable (e.g., static GitHub Pages), `client-api.ts` reads from the public Gist, hydrates WhatsApp-shared posts via URL payload `&d=`, and persists user actions locally.
