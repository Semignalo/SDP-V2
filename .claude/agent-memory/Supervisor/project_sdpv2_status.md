---
name: SDP-V2 Project Status
description: Status project SDP-V2 per 2026-04-17 — evaluasi lengkap semua phase, fitur implemented, dan gaps
type: project
---

Project SDP-V2 berada di tahap lanjut development — backend dan frontend core sudah solid, tapi testing dan production-readiness belum ada.

**Phase yang sudah COMPLETE:**

Backend:
- Auth (register, login, logout, Sanctum token, profile update/password)
- Product CRUD + media upload + variant support + stock tracking + lockForUpdate
- Order flow lengkap: checkout → payment proof upload → admin review → status update → commission distribute
- Commission system: single-level (regular) + MLM 7-level (starcenter) + cancel on reversal
- Tier system: auto-upgrade on order complete + scheduled downgrade via artisan command
- Admin dashboard: revenue stats, monthly chart, top products, commission stats, recent orders
- Admin endpoints: users CRUD + role update, commissions bulk pay + export, orders export
- Settings: appearance (hero, branding) + payment info + system settings (MLM rates, MOQ, shipping)
- Performance indexes (migration 2026-04-16), private storage untuk payment proof
- Tracking number endpoint (migration 2026-04-17)

Frontend:
- Auth flow: login/register/logout + referral code support + password strength indicator
- Catalog + filter + search + ProductCard + ProductDetail + variant selector
- Cart (CartDrawer + CartContext, persisted localStorage)
- Checkout 3-step: Shipping → Review → Payment (upload bukti bayar)
- Invoice page
- Profile (multi-tab: orders history, commissions, network tree, edit profile)
- TrackOrders page
- Admin panel: Dashboard (recharts), Products CRUD, Orders management, Users, Commissions, Tiers, Appearance settings, Payment settings
- Lazy loading semua pages + ErrorBoundary + Skeleton + PageLoader + ConfirmModal
- AppearanceContext (branding dari API)

**Masih PENDING / INCOMPLETE:**
- Testing: coverage 0% — hanya ExampleTest.php placeholder, tidak ada test untuk commission, order, tier logic
- CI/CD: tidak ada pipeline GitHub Actions atau deployment automation
- Frontend: MOQ warning di CartDrawer belum dari settings API (masih hardcoded?)
- Backend: N+1 query di CommissionService (setiap level MLM query DB tersendiri)
- Backend: Rate limiting global (hanya auth throttle 5/menit yang ada)
- Wallet/withdraw system: belum ada (commission masih manual "paid" oleh admin)
- Email notification: tidak ada (tidak ada Laravel Mail/notification setup)
- About page: placeholder "Coming Soon"
- Password reset / forgot password: tidak ada endpoint

**Bug kritis yang sudah diperbaiki:**
- Login.jsx baris 33 (useMemo sebelum useState) — sudah FIXED, urutan hooks sekarang benar
- TierService B6 (reset last_transaction_at setelah downgrade) — sudah FIXED

**Evaluasi terakhir:** 2026-04-19 (supervisor review — status tidak berubah dari 2026-04-17, tidak ada commit baru sejak da52c25)

**Risiko teratas per 2026-04-17:**
1. Test coverage 0% — commission logic (finansial) belum ada automated test sama sekali
2. N+1 query CommissionService — perlu eager loading atau single query untuk MLM chain
3. Tidak ada CI/CD — deploy manual
4. Email notification tidak ada — buyer tidak tahu status order mereka berubah
5. Forgot password tidak ada — user yang lupa password tidak bisa recover akun

**Why:** E-commerce + MLM platform mendekati production. Commission dan stok adalah area finansial paling berisiko.

**How to apply:** Prioritas ke testing commission/order sebelum push ke production. Jangan tambah fitur baru (wallet, notifikasi) sebelum test suite minimal untuk core flow ada.
