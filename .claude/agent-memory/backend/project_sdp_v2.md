---
name: SDP-V2 Backend Project State
description: Status phase pengerjaan backend SDP-V2, PHP binary location, dan konteks teknis penting
type: project
---

PHP binary di Windows Laragon: `/c/laragon/bin/php/php-8.3.30-Win32-vs16-x64/php.exe`
Gunakan path ini untuk semua perintah artisan dan pint.

**Why:** PHP tidak ada di PATH default bash shell di environment ini.

**How to apply:** Selalu gunakan `PHP_BIN="/c/laragon/bin/php/php-8.3.30-Win32-vs16-x64/php.exe"` lalu `"$PHP_BIN" artisan ...`

---

Phase 0 (A1-A4) selesai per 2026-04-16:
- A1: Scheduler `tier:check-downgrades` didaftarkan di `routes/console.php` (dailyAt 02:00)
- A2: Rate limiting `throttle:5,1` di POST /register dan POST /login
- A3: `NetworkController` dan `CommissionController` dibuat; inline route logic dipindahkan
- A4: `CheckoutRequest` FormRequest dibuat dengan validasi variant_id milik product_id

Phase 1 (B1-B6) selesai per 2026-04-16:
- B1: DB_CONNECTION diubah ke mysql (sdp_v2 database), migration sukses
- B2: Migration 2026_04_16_000001 menambahkan 6 indexes (users, orders, commissions, starcenter_network)
- B3: SystemSetting::getValue() sekarang di-cache 1 jam via Cache::remember, invalidasi di setValue()
- B4: Kolom stock ditambahkan ke products dan product_variants (nullable=unlimited). OrderService: lockForUpdate + validateStock + decrement stok. restoreStock() saat order rejected.
- B5: UploadPaymentProofRequest (MIME: jpg/png/pdf, max 2MB). File disimpan ke private 'local' disk. Endpoint admin GET /admin/payment-proofs/{id}/file untuk akses file.
- B6: Bug TierService::checkDowngrades() diperbaiki — hapus reset last_transaction_at setelah downgrade.

Phase berikutnya: Phase 2 (C1-C4) — N+1 fix CommissionService, compression, rate limiting global.
