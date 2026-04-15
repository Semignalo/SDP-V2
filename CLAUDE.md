# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SDP-V2 is a full-stack e-commerce and MLM (multi-level marketing) platform. It is a monorepo with a React + Vite frontend at the root and a Laravel 13 API backend in `starinc-api/`.

## Commands

### Frontend (root directory)
```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Backend (starinc-api/)
```bash
# PHP / Laravel
php artisan serve          # Start API server (default: localhost:8000)
php artisan migrate        # Run database migrations
php artisan migrate:fresh --seed  # Reset DB and seed
php artisan test           # Run PHPUnit tests
php artisan tinker         # Interactive REPL
./vendor/bin/pint          # Format PHP code (Laravel Pint)

# Composer scripts
composer run dev           # Start Laravel + Vite concurrently
composer run test          # Clear config then run tests
```

### Full-stack development
Run `php artisan serve` in `starinc-api/` and `npm run dev` in the root simultaneously.

## Architecture

### Frontend → Backend Communication
All API calls go through `src/api/client.js` — an Axios instance configured with:
- Base URL: `VITE_API_URL` (default `http://localhost:8000/api`)
- Request interceptor: auto-injects `Authorization: Bearer <token>` from localStorage
- Response interceptor: handles 401 (redirect to login) and 422 (validation errors)

API modules in `src/api/` mirror backend controllers: `authApi.js`, `productApi.js`, `orderApi.js`, `networkApi.js`, `adminApi.js`, `settingsApi.js`.

### Frontend State Management
Three React Contexts manage global state:
- **AuthContext** — current user, token, login/logout
- **CartContext** — shopping cart (persisted to localStorage)
- **AppearanceContext** — theme/branding fetched from API

### Routing Structure (App.jsx)
- Public routes under `RootLayout`: home, products, checkout, orders, profile, login
- Admin routes under `AdminLayout` at `/admin/*`: dashboard, products, orders, users, commissions, tiers, settings

### Backend Architecture
- **Controllers** (`app/Http/Controllers/Api/`) handle HTTP, delegate business logic to Services
- **Services** contain all business logic:
  - `OrderService` — server-side price calculation, inventory checks, tier discounts
  - `CommissionService` — distributes commissions (1 level for regular, up to 7 levels for Starcenter MLM)
  - `TierService` — upgrades user tiers based on cumulative spending
- **Middleware** `EnsureIsAdmin` protects all `/admin/*` routes, checking `$user->role === 'admin'`
- Authentication uses Laravel Sanctum (stateless Bearer tokens)

### User Role System
Three roles: `regular`, `starcenter`, `admin`
- Regular users: single-level commissions, no MOQ requirement
- Starcenter: multi-level MLM commissions (up to 7 levels), MOQ applies
- Admin: full access to admin panel

### Commission/MLM System
`StarcenterNetwork` table uses a closure-table adjacency structure with a `depth` column (1–7) to track upline chains. `CommissionService::distribute()` is called after order completion and walks the tree to assign commission records.

### Key Data Models
- **User**: `referrer_id`, `referral_code` (unique 8-char), `tier_id`, `role`, `cumulative_spending`
- **Order**: `order_number` (INV-XXXXXXXX), `status` (`pending_payment` → `awaiting_confirmation` → `completed`/`cancelled`)
- **Commission**: `level` (1–7), `status` (`pending`/`paid`/`cancelled`), linked to User + Order + SourceUser
- **Tier**: `min_spend`, discount percentage; tiers auto-upgrade based on cumulative spending

## Environment Configuration

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:8000/api
VITE_STORAGE_URL=http://localhost:8000/storage
```

### Backend (`starinc-api/.env`, based on `.env.example`)
Key settings: `DB_CONNECTION=sqlite`, `QUEUE_CONNECTION=database`, `CACHE_STORE=database`. SQLite database is at `starinc-api/database/database.sqlite`.

## Deployment
Frontend is deployed to Firebase Hosting (project `sdp-v2-553c0`). The `firebase.json` configures SPA routing rewrites.
