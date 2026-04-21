---
name: SDP-V2 Project Status
description: Status project SDP-V2 per 2026-04-19 — Phase 2 testing dimulai, 34/42 tests passing, 8 failing
type: project
---

Project SDP-V2 berada di tahap lanjut development — backend dan frontend core sudah solid. Phase 2 testing telah dimulai (2026-04-19).

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

**Phase 2 Testing (dimulai 2026-04-19):**
- TestCase.php: RefreshDatabase + TierSeeder + SystemSetting::flushCache()
- 6 factory: TierFactory, ProductFactory, ProductVariantFactory, OrderFactory, OrderItemFactory, CommissionFactory
- 3 test files: CommissionServiceTest (10 tests), OrderServiceTest (17 tests), TierServiceTest (15 tests)
- Status: 34/42 passing, 8 failing — analisis sedang berlangsung

**Known Issues di 8 failing tests (analisis 2026-04-19):**
1. TierServiceTest: `test_evaluate_upgrade_skips_starcenter_role` dan `test_evaluate_upgrade_skips_admin_role` — pakai `User::factory()->asStarcenter()->first()` (anti-pattern: factory->first() bukan untuk ambil existing user; akan null karena DB fresh)
2. TierServiceTest: `test_check_downgrades_does_not_reset_last_transaction_at` — `withLastTransaction(Carbon $at)` type hint Carbon tapi test kirim `now()->subDays(45)` — perlu konfirmasi apakah Carbon atau CarbonImmutable
3. OrderServiceTest: `test_create_order_applies_tier_discount` — Silver tier discount 15%, total harusnya 200000 - 30000 + 20000 = 190000, bukan 190000 (OK sebenarnya). Perlu verifikasi assertion `total` vs actual OrderService behavior
4. CommissionServiceTest: `assertDatabaseCount` dengan 3 argumen — method ini hanya terima 2 argumen di Laravel; argumen ke-3 `['status' => 'cancelled']` tidak valid
5. UserFactory: `withLastTransaction` type hint `Carbon` tapi `now()->subDays()` returns `Carbon\Carbon` yang OK — kemungkinan fine

**Masih PENDING / INCOMPLETE:**
- Testing: 8 tests failing, CI/CD belum ada
- Frontend: MOQ warning di CartDrawer masih hardcoded?
- Backend: N+1 query di CommissionService (sudah ada single query, tapi perlu benchmark)
- Rate limiting global belum ada
- Wallet/withdraw system: belum ada
- Email notification: tidak ada
- About page: placeholder "Coming Soon"
- Password reset / forgot password: tidak ada endpoint

**Bug kritis yang sudah diperbaiki:**
- Login.jsx baris 33 (useMemo sebelum useState) — sudah FIXED
- TierService B6 (reset last_transaction_at setelah downgrade) — sudah FIXED

**Evaluasi terakhir:** 2026-04-19 (supervisor review — comprehensive evaluation, roadmap sampai production)

**Why:** E-commerce + MLM platform mendekati production. Commission dan stok adalah area finansial paling berisiko.

**How to apply:** Prioritas ke fixing 8 failing tests sebelum push ke CI/CD. Setelah tests hijau, barulah setup GitHub Actions pipeline.
