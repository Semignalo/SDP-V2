---
name: SDP-V2 Project Status
description: Status project SDP-V2 per 2026-04-16 — apa yang sudah selesai, pending, dan risiko utama lintas tim
type: project
---

Project SDP-V2 berada di antara Phase 1 selesai dan siap masuk Phase 2 (backend) / Phase 3 (frontend).

**Phase yang sudah selesai:**
- Backend Phase 0 (A1–A4): scheduler tier, rate limiting auth, pindah logic ke Controller, validasi variant_id
- Backend Phase 1 (B1–B6): MySQL migration, DB indexes, cache SystemSetting, stok validation + lockForUpdate, upload bukti bayar private, fix bug TierService
- Backend Hotfix: endpoint POST /api/admin/upload untuk Appearance page
- Frontend Phase 0 (A1–A4): migrasi Firebase ke Laravel API selesai, firebase.js dihapus, dependency dihapus
- Frontend Phase 2 (D1, D2, E2, B2, B3, D5, D6, H1, H3): refactor komponen, skeleton, multi-tab cart, ESLint clean
- UI/UX Phase 0 (A1, A2, B1, B2, D1, D2, D4, E1, E2): design token audit, stepper checkout, MOQ warning, dashboard, filter tabs, ConfirmModal, touch targets

**Masih pending (high priority):**
- Frontend: D3 (React.lazy), D4 (ErrorBoundary), E1 (MOQ CartDrawer dari settings API), F1 (Vite chunks), G2 (validasi upload checkout), C1 (error handling client.js)
- Backend Phase 2: C1 (N+1 CommissionService), C3 (rate limiting global)
- Testing: hampir 0% coverage — belum ada test suite
- DevOps: CI/CD belum ada, MySQL prod server belum diprovision

**Risiko teratas:**
1. Test coverage 0% — bug commission bisa lolos ke production
2. N+1 query di CommissionService saat MLM chain panjang
3. Firebase API key mungkin masih di git history (perlu rotate key)
4. Tidak ada CI/CD — deploy manual, rawan human error

**Why:** Proyek e-commerce + MLM yang sedang dibangun dari tahap awal menuju production. Commission system menyangkut finansial — area paling berisiko.

**How to apply:** Setiap rekomendasi harus memprioritaskan keamanan financial (commission, stok, checkout) di atas fitur baru. Jangan approve Phase 3 (Wallet) sebelum test suite commission ada.

---

**Bug kritis ditemukan 2026-04-16 (investigasi blank white page):**
1. `src/pages/Login.jsx` baris 33 — `useMemo` menggunakan `isLogin` SEBELUM state `isLogin` dideklarasikan di baris 45. Ini melanggar Rules of Hooks dan menyebabkan ReferenceError saat runtime. Halaman Login crash, dan karena banyak halaman lain redirect ke /login saat user belum login, mereka pun blank.
2. Kemungkinan penyebab kedua: AuthContext `{!loading && children}` — jika backend tidak bisa dijangkau, token ada di localStorage tapi API call `/user/profile` gagal (network error, bukan 401), maka `loading` tetap false setelah catch, tapi `currentUser` null. Ini bisa menyebabkan halaman yang butuh `currentUser` render prematurely atau redirect.
3. `src/lib/tierUtils.js` masih ada code `.toDate()` (Firestore-specific) tapi tidak dipanggil saat render — bukan crash cause.
