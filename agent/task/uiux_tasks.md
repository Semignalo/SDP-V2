# Task List — Tim UI/UX

> Proyek: SDP-V2 (E-commerce + MLM Platform)
> Stack: React 19 + Vite + Tailwind CSS 4
> Tanggal: 2026-04-15

---

## 1. Ringkasan Tanggung Jawab

Tim UI/UX bertanggung jawab memastikan pengalaman pengguna konsisten, intuitif, dan sesuai dengan alur bisnis e-commerce serta sistem MLM. Fokus pada desain antarmuka, usability, konsistensi visual, dan aksesibilitas.

---

## 2. Task Breakdown

### A. Design System & Konsistensi Visual

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| A1 | Audit design token Tailwind | High | Review warna, spacing, typography di `tailwind.config.js`. Pastikan brand color konsisten di seluruh halaman publik dan admin. |
| A2 | Buat style guide komponen | High | Dokumentasikan varian Button, Input, Card, Badge, Modal. Simpan di Figma atau file markdown di `agent/docs/`. |
| A3 | Definisikan skeleton loading pattern | Medium | Desain skeleton untuk list produk, list order, dan tabel admin (T4 di technical debt). |
| A4 | Empty state illustrations | Medium | Desain empty state untuk: cart kosong, belum ada order, belum ada komisi, belum ada downline. |
| A5 | Icon set konsistensi | Low | Gunakan `lucide-react` secara konsisten, hindari campur icon set. |

### B. User Flow E-commerce

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| B1 | Review alur Checkout | High | Evaluasi `Checkout.jsx`. Pastikan langkah jelas: alamat → review order → metode bayar → upload bukti. Tambahkan progress stepper. |
| B2 | Desain tampilan MOQ warning | High | Untuk role `starcenter`, tampilkan peringatan MOQ di Cart Drawer (mengacu ke task 1.6 roadmap). |
| B3 | Perbaiki Cart Drawer UX | Medium | Pastikan update quantity, hapus item, dan kalkulasi total real-time terasa responsif. |
| B4 | Invoice page design | Medium | Desain halaman invoice public agar printable dan readable (tambahkan tombol print/download PDF). |
| B5 | Status order timeline | Medium | Visualisasi timeline: `pending_payment` → `awaiting_confirmation` → `completed`/`cancelled` dengan ikon dan tanggal. |

### C. User Flow MLM & Starcenter

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| C1 | Network Tree visualization | High | Review visualisasi downline tree (`NetworkTree`). Pastikan dapat zoom, collapse/expand level, dan mobile-friendly. |
| C2 | Halaman Join Starcenter | High | Perjelas benefit, syarat, dan CTA untuk upgrade ke starcenter. Tambahkan perbandingan regular vs starcenter. |
| C3 | Desain Referral Link sharing | Medium | UI untuk copy/share referral link dengan tombol copy, share ke WhatsApp, dan QR code. |
| C4 | Dashboard Starcenter (Center Shop) | Medium | Highlight: total komisi bulan ini, jumlah downline aktif, pending commission, progress menuju tier berikutnya. |
| C5 | Wallet page design (P1.1) | Medium | Desain halaman Wallet: saldo, riwayat kredit/debit, form withdraw. Acuan: roadmap Phase 3. |

### D. Admin Panel UX

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| D1 | Dashboard admin metric hierarchy | High | Pastikan KPI utama (revenue, order, user, komisi) paling menonjol. Chart Recharts harus jelas. |
| D2 | Data table UX standard | High | Filter, search, pagination, sort konsisten di Orders, Users, Products, Commissions. |
| D3 | Bulk action pattern | Medium | Desain pola "select multiple → bulk pay commission" yang jelas dan aman. |
| D4 | Modal konfirmasi destruktif | High | Pastikan semua aksi destruktif (delete product, cancel order, downgrade role) punya konfirmasi bertingkat. |
| D5 | Admin Appearance CMS editor | Medium | Setelah migrasi P0.1 selesai, desain ulang editor Appearance agar WYSIWYG. |

### E. Responsivitas & Aksesibilitas

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| E1 | Mobile-first audit | High | Test seluruh halaman di breakpoint mobile (375px), tablet (768px), desktop (1280px). |
| E2 | Touch target minimum 44x44px | High | Pastikan semua tombol dan link di mobile memenuhi standar aksesibilitas. |
| E3 | Kontras warna (WCAG AA) | Medium | Cek semua kombinasi foreground/background memenuhi rasio 4.5:1. |
| E4 | Keyboard navigation | Medium | Pastikan seluruh form dan modal bisa dinavigasi dengan keyboard. |
| E5 | Focus indicator visible | Medium | Ring focus Tailwind harus terlihat di semua komponen interaktif. |

### F. Authentication & Onboarding

| # | Task | Prioritas | Deskripsi |
|---|------|-----------|-----------|
| F1 | Redesign Login & Register | Medium | Tambahkan validasi inline, password strength indicator, dan tampilan referral code yang auto-filled dari URL. |
| F2 | Onboarding tooltip | Low | Tooltip singkat untuk first-time user: cara checkout, cara cek komisi, cara share referral. |
| F3 | Empty state profile baru | Low | Tampilan saat user belum pernah transaksi. |

---

## 3. Prioritas Task

### High Priority (Minggu 1-2)
- A1, A2, B1, B2, C1, C2, D1, D2, D4, E1, E2

### Medium Priority (Minggu 3-4)
- A3, A4, B3, B4, B5, C3, C4, C5, D3, D5, E3, E4, E5, F1

### Low Priority (Backlog)
- A5, F2, F3

---

## 4. Deliverables

1. Figma file dengan design system lengkap
2. Komponen reference di `src/components/ui/`
3. Dokumentasi pattern library di `agent/docs/uiux/`
4. Screenshot before/after untuk setiap perubahan major
5. Review checklist untuk handoff ke tim Frontend

---

## 5. Risiko & Catatan

- **Risiko**: Design system belum distandarisasi berpotensi menyebabkan inkonsistensi antara halaman publik dan admin.
- **Catatan**: Proyek menggunakan Tailwind CSS 4 — hindari custom CSS kecuali benar-benar terpaksa.
- **Koordinasi**: Sinkron dengan tim Frontend untuk menentukan komponen mana yang direusable.
- **Dependency**: Halaman Wallet (C5) baru bisa didesain final setelah skema backend P1.1 disepakati.
