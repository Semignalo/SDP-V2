# Task List — Tim Frontend

> Proyek: SDP-V2 (E-commerce + MLM Platform)
> Stack: React 19 + Vite 7 + Tailwind CSS 4 + Axios
> Tanggal: 2026-04-15

---

## 1. Ringkasan Tanggung Jawab

Tim Frontend bertanggung jawab implementasi UI, integrasi dengan API Laravel, state management, dan kualitas kode React. Fokus saat ini: menyelesaikan migrasi Firebase ke Laravel API dan optimasi bundle.

---

## 2. Task Breakdown

### A. CRITICAL — Phase 0 (Cleanup & Stabilisasi)

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| A1 | Migrasi `PaymentSettings.jsx` dari Firebase ke Laravel API | Critical | `src/pages/admin/PaymentSettings.jsx` | Ganti `firebase/firestore` dengan `settingsApi`. Endpoint: `/api/admin/settings`. |
| A2 | Migrasi `Appearance.jsx` dari Firebase ke Laravel API | Critical | `src/pages/admin/Appearance.jsx` (538 baris) | Ganti `getDoc/setDoc` Firestore dengan `settingsApi`. Endpoint: `/api/admin/appearance`. |
| A3 | Hapus `src/lib/firebase.js` | Critical | `src/lib/firebase.js`, `package.json` | Setelah A1 & A2 selesai, hapus file firebase dan dependency `firebase` di `package.json`. |
| A4 | Pindahkan Firebase API key ke `.env` sementara | Critical | `.env`, `src/lib/firebase.js` | Sebelum A1-A3 selesai, pastikan API key tidak hardcoded. Gunakan `VITE_FIREBASE_API_KEY`. |

### B. State Management & Context

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| B1 | Review AuthContext token persistence | High | `src/contexts/AuthContext.jsx` | Pastikan token Sanctum tersimpan aman di localStorage + auto-logout saat expired. |
| B2 | Cart persistence multi-tab sync | Medium | `src/contexts/CartContext.jsx` | Sync cart antar tab via `storage` event listener. |
| B3 | AppearanceContext cache | Medium | `src/contexts/AppearanceContext.jsx` | Cache response API dengan timestamp agar tidak fetch ulang setiap render. |
| B4 | Buat `WalletContext` (P1.1) | Medium | buat `src/contexts/WalletContext.jsx` | Setelah endpoint wallet tersedia. |

### C. API Layer

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| C1 | Standardisasi error handling `client.js` | High | `src/api/client.js` | Pastikan semua error 401, 422, 403, 500 di-handle konsisten. Gunakan Sweetalert2. |
| C2 | Buat `walletApi.js` | Medium | `src/api/walletApi.js` | `getWallet()`, `requestWithdraw()`. Mengacu ke Phase 3 roadmap. |
| C3 | Retry logic untuk 5xx errors | Low | `src/api/client.js` | Axios retry dengan exponential backoff. |
| C4 | Loading state global | Medium | buat `src/hooks/useApi.js` | Custom hook untuk handle loading, error, data state standar. |

### D. Halaman & Komponen — Optimasi

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| D1 | Pecah `Catalog.jsx` (277 baris) | Medium | `src/pages/Catalog.jsx` | Ekstrak: `ProductGrid`, `ProductFilters`, `SearchBar` ke komponen terpisah. |
| D2 | Pecah admin `Products.jsx` (815 baris) | High | `src/pages/admin/Products.jsx` | Ekstrak: `ProductFormModal`, `ProductTable`, `ProductMediaUploader`. |
| D3 | React.lazy() untuk semua halaman | High | `src/App.jsx` | Gunakan `lazy()` dan `<Suspense>`. Target bundle initial < 300KB. |
| D4 | Error boundary untuk halaman admin | High | buat `src/components/ErrorBoundary.jsx` | Tangkap runtime error, tampilkan fallback UI. |
| D5 | Loading skeleton komponen | Medium | buat `src/components/Skeleton.jsx` | Skeleton untuk product card, order row, commission row. |
| D6 | Image lazy load di Catalog | Medium | `src/components/ProductCard.jsx` | `loading="lazy"` + optional Intersection Observer. |

### E. Fitur Baru (Phase 1-3)

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| E1 | Tampilkan MOQ warning di Cart | High | `src/components/CartDrawer.jsx` | Untuk role `starcenter`, cek MOQ dari `systemSettings` dan tampilkan warning. |
| E2 | Status "Habis" di product card | High | `src/components/ProductCard.jsx` | Setelah backend implement validasi stok (P1.3), tampilkan overlay "Habis". |
| E3 | Halaman Wallet | Medium | buat `src/pages/profile/Wallet.jsx` | Saldo + riwayat + form withdraw. Depend on Phase 3 roadmap backend. |
| E4 | Notifikasi toast untuk order status | Medium | `src/pages/profile/Orders.jsx` | Toast saat status order berubah (polling atau websocket). |
| E5 | Download invoice sebagai PDF | Low | `src/pages/Invoice.jsx` | Gunakan `react-to-print` atau library serupa. |

### F. Build & Bundle Optimization

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| F1 | Vite manual chunks | High | `vite.config.js` | Split: vendor (react, router), charts (recharts), ui (sweetalert2, lucide). |
| F2 | Analyze bundle size | Medium | - | Jalankan `vite-bundle-visualizer` untuk identifikasi bundle besar. |
| F3 | Hapus unused dependencies | Medium | `package.json` | Setelah migrasi firebase, cek dependency yang tidak digunakan. |
| F4 | Tree-shaking audit | Low | - | Pastikan import spesifik, hindari `import *`. |

### G. Form Handling & Validasi

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| G1 | Inline validation di Register form | Medium | `src/pages/Register.jsx` | Validasi password strength, email format, phone format. |
| G2 | Validasi upload bukti bayar | High | `src/pages/Checkout.jsx` | Cek ukuran file (max 2MB), tipe (jpg/png/pdf) sebelum submit. |
| G3 | Form dirty state warning | Low | - | Peringatan saat user menutup halaman dengan form belum disimpan. |

### H. Testing & Quality

| # | Task | Prioritas | File | Deskripsi |
|---|------|-----------|------|-----------|
| H1 | ESLint pass 100% | High | - | Jalankan `npm run lint`, fix semua warning. |
| H2 | Setup Vitest untuk komponen | Medium | `vitest.config.js` | Buat test minimal untuk komponen kritis (CartDrawer, Checkout). |
| H3 | Prop types / TypeScript migration plan | Low | - | Evaluasi migrasi bertahap ke TypeScript. |

---

## 3. Prioritas Task

### Critical (Selesaikan minggu ini)
- A1, A2, A3, A4

### High (Minggu 1-2)
- B1, C1, D2, D3, D4, E1, E2, F1, G2, H1

### Medium (Minggu 3-4)
- B2, B3, B4, C2, C4, D1, D5, D6, E3, E4, F2, F3, G1, H2

### Low (Backlog)
- C3, E5, F4, G3, H3

---

## 4. Deliverables

1. PR untuk setiap task dengan deskripsi jelas (ikuti konvensi commit: `feat:`, `fix:`, `refactor:`)
2. `npm run build` selalu hijau sebelum merge
3. `npm run lint` 0 error, 0 warning
4. Screenshot before/after untuk perubahan UI
5. Dokumentasi API integration di JSDoc komponen

---

## 5. Risiko & Catatan

- **Risiko Kritis**: Firebase API key exposed di git history. Setelah A3 selesai, pertimbangkan rotasi key via Firebase Console.
- **Catatan**: SEMUA API call harus melalui `src/api/`, jangan fetch langsung di komponen (konvensi).
- **Mobile-first**: Mulai kelas Tailwind dari base, tambahkan `md:`, `lg:` untuk breakpoint lebih besar.
- **Dependency**: Task E2, E3, E4 menunggu implementasi backend terlebih dahulu.
- **Coordinate**: Sinkron dengan tim UI/UX untuk design token dan komponen reusable.
