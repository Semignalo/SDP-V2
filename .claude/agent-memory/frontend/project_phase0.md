---
name: Phase 0 completion
description: Firebase dihapus total dari frontend, semua migrasi ke Laravel API selesai di Phase 0
type: project
---

Phase 0 selesai pada 2026-04-16. Semua task A1-A4 completed.

**Why:** Firebase API key hardcoded di source code (risiko keamanan). Migrasi ke Laravel API untuk konsistensi arsitektur.

**How to apply:** Jangan tambahkan import firebase lagi. Semua settings/appearance menggunakan `adminSettingsApi` dari `src/api/settingsApi.js`.

**Catatan pending backend:** Endpoint `POST /api/admin/upload` belum ada di backend — diperlukan untuk fitur upload video di halaman Appearance admin.
