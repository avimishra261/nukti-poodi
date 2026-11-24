# 02 — API Reference, Database & Trust Rules

## 1. REST API Endpoints

### `GET /api/bhandaras`
Returns all visible bhandaras (`isHidden === false`) with auto-rolled seed timestamps.
- **Query params:** `?all=true` returns hidden/reported posts too (used by `/admin`).
- **Response (`200`):** `{ bhandaras: Bhandara[], updatedAt: string }`

### `POST /api/bhandaras`
Creates a new bhandara record.
- **Required fields:** `title` (min 3 chars), `area`, `landmark`.
- **Optional fields:** `organizerName`, `foodItems[]`, `description`, `address`, `lat`, `lng`, `startTime`, `endTime`, `photoUrl`, `createdBy`, `createdByName`.
- **Server Guardrails:**
  - Enforces max duration of **24 hours** between `startTime` and `endTime`.
  - Enforces **5 posts per 24 hours** anti-spam limit per `createdBy` (`429 Too Many Requests` if exceeded).
- **Response (`201`):** `{ bhandara: Bhandara }`

### `GET /api/bhandaras/[id]`
Fetches a single bhandara by ID (`404` if not found).

### `PATCH /api/bhandaras/[id]`
Updates fields on a bhandara (used by Owner `Bhandara Khatam Mark Karein` and `/admin` moderation).
- **Example body:** `{ isVerified: true }`, `{ isHidden: false }`, or `{ endTime: "..." }`.

### `DELETE /api/bhandaras/[id]`
Deletes a bhandara permanently (`200 { deleted: true }`).

### `POST /api/bhandaras/[id]/vote`
Records a community status vote or crowd level update.
- **Body:** `{ voteType?: 'chal_raha' | 'khatam' | 'fake', crowdLevel?: 'normal' | 'medium' | 'heavy' }`
- **Auto-Moderation Rules:**
  - `votes.khatam >= 3` → `getBhandaraStatus()` automatically marks the bhandara as `ended`.
  - `votes.fake >= 3` → server automatically sets `isHidden = true` and queues it for `/admin` review.

---

## 2. Cloud Gist DB & Supabase Migration
- **Active Cloud Store:** Public-read, token-writable GitHub Gist (`nukti-poodi-db.json`), ID `6435d342ddd3be516a1f405f24bdfbe8`.
- **Supabase Ready:** Run `supabase/schema.sql` in Supabase SQL Editor whenever you want Postgres + Google OAuth + Storage buckets for high-scale traffic (Navratri / Hanuman Jayanti).
