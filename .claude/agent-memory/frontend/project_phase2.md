---
name: frontend_phase2
description: Phase 2 frontend selesai 2026-04-16 — komponen dipecah, skeleton, lazy load, multi-tab sync, appearance cache, debounce search
type: project
---

Phase 2 frontend selesai pada 2026-04-16. Semua 8 task diselesaikan.

**Why:** Meningkatkan maintainability, UX (skeleton loading, lazy image), dan performa (debounce, cache).

**How to apply:** Phase 3 selanjutnya fokus ke React.lazy(), Error Boundary, Vite chunks, MOQ warning (butuh backend B4).

**Yang dikerjakan:**
- D2: admin/Products.jsx dipecah ke ProductTable, ProductFormModal, ProductMediaUploader di src/components/admin/
- E2: ProductCard support field `stock` — overlay "Habis" + grayscale
- D6: loading="lazy" di semua img
- B2: CartContext multi-tab sync via window.addEventListener('storage')
- B3: AppearanceContext cache localStorage TTL 5 menit + refreshAppearance()
- D1: Catalog.jsx dipecah ke catalog/SearchBar, catalog/ProductFilters, catalog/ProductGrid
- D5: src/components/Skeleton.jsx dibuat (ProductCardSkeleton, OrderRowSkeleton, CommissionRowSkeleton, TableRowSkeleton)
- H3: SearchBar debounce 300ms
- H1 (bonus): ESLint src/ = 0 error via perbaikan dan ignore vendor di eslint.config.js
