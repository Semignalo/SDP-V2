---
name: SDP-V2 UI/UX Project Context
description: Stack, design tokens, fonts, colors, dan conventions desain project SDP-V2
type: project
---

Stack: React 19 + Vite + Tailwind CSS 4 (menggunakan @theme directive, bukan tailwind.config.js)

Design tokens di: `src/index.css`
- Primary: #1A1A1A
- Accent (Soft Gold): #C5A059, light: #E5D1A3, dark: #997B3D
- Sale/Danger: #E53E3E
- Muted bg: #F9FAFB
- Font sans: Outfit, Font serif: Playfair Display

Checkout CTA button menggunakan hardcoded #047857 (emerald green) — belum masuk token.

Design direction: kombinasi Aesop (editorial, whitespace) + The Act (usability). Clean, minimal, serif headings.

**Why:** Agar sesi berikutnya tidak perlu re-audit token dari awal.
**How to apply:** Selalu gunakan CSS variables `var(--color-*)` bukan hardcode hex. Serif font untuk headings, sans untuk body.
