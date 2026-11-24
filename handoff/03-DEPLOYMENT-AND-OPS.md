# 03 — Deployment, Environment & Admin Operations

## 1. Live Production Environments
- **Primary Server-Backed Production (Vercel):** Configured via `vercel --prod` with Cloud Gist DB environment variables so every user across Indore shares real-time posts and votes.
- **Mirror Static PWA (GitHub Pages):** Automatically deployed on every push to `main` via `.github/workflows/deploy.yml` at `https://avimishra261.github.io/nukti-poodi/`.

---

## 2. Environment Variables (Vercel & `.env.local`)
| Variable | Purpose | Scope |
|---|---|---|
| `GITHUB_DB_TOKEN` | GitHub Personal/OAuth token with `gist` scope for server-side writes | Server only (never exposed to browser) |
| `GITHUB_DB_GIST_ID` | Gist ID (`6435d342ddd3be516a1f405f24bdfbe8`) | Server |
| `NEXT_PUBLIC_GIST_ID` | Gist ID for static fallback reads | Client + Server |

> **Security Note:** Never commit `.env.local` to git (already listed in `.gitignore`).

---

## 3. Admin Moderation Guide (`/admin`)
- Open `/admin` on the live site.
- **Passcode:** `jai-bhandara-indore` (also has a quick unlock option for testing; change `ADMIN_PASSCODE` in `src/app/admin/page.tsx` before sharing widely).
- **Capabilities:**
  - `Verify / Unverify`: Grant the green `✓ Verified Mandir` badge to trusted Indore temples & trusts.
  - `Hide / Restore`: Hide spam posts or restore posts auto-hidden by 3+ fake flags.
  - `Reset Flags`: Clear `khatam` and `fake` counters back to `0`.
  - `Delete`: Permanently remove a post.

---

## 4. Custom Domain Setup (`nuktipoodi.in`)
1. Purchase `nuktipoodi.in` (Namecheap / GoDaddy / Porkbun, ~₹500–800/year).
2. In Vercel Dashboard → Project **Settings → Domains** → Add `nuktipoodi.in` & `www.nuktipoodi.in`.
3. Point DNS `A` record (`76.76.21.21`) and `CNAME` (`cname.vercel-dns.com`). HTTPS SSL activates automatically.
