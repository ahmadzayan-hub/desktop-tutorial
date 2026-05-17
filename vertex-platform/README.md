# VERTEX — Session 1 Foundation

Professional Contract & Project Intelligence platform. This directory contains
the **Session 1** foundation: authentication, database schema, bilingual
(English / Arabic) UI with full RTL support, and a mobile-responsive,
accessible layout.

## What's in Session 1

- React 18 + TypeScript + Vite scaffold (mobile-first, responsive)
- Supabase PostgreSQL schema — 10 tables with RLS policies
  (Admin > Reviewer > Viewer > API User)
- Supabase email/password authentication (30-day refresh sessions)
- i18next bilingual setup with localStorage persistence
- RTL-aware layout using CSS Logical Properties (auto-flips for Arabic)
- Language toggle in the header (instant interface switch)
- Protected `/dashboard` route (placeholder for Session 2)
- Accessibility foundations: skip link, semantic HTML, ARIA labels,
  focus rings, 44px touch targets, 48px form inputs

## Quick start

```bash
cd vertex-platform

# 1. Install deps
npm install

# 2. Configure
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
# (Supabase dashboard → Settings → API)

# 3. Apply the database schema
#    Paste supabase/migrations/0001_vertex_init.sql into the
#    Supabase SQL editor and run.

# 4. Create a test user
#    Supabase dashboard → Authentication → Users → Add user
#    (the `on_auth_user_created` trigger seeds public.users automatically)

# 5. Run the dev server
npm run dev
# → http://localhost:5173
```

## Project structure

```
vertex-platform/
├── src/
│   ├── components/
│   │   ├── layout/          Header, Sidebar, Footer, LanguageSwitcher, AppShell
│   │   ├── auth/            AuthProvider, LoginForm, ProtectedRoute
│   │   └── common/          RTLWrapper, BiDiText
│   ├── pages/               Login, Dashboard, NotFound
│   ├── hooks/               useAuth, useLanguage, useRTL
│   ├── locales/             en/common.json, ar/common.json
│   ├── types/               Shared TS types
│   ├── utils/               supabase.ts, i18n.ts, api.ts, formatters.ts
│   ├── styles/              globals.css, rtl.css
│   ├── App.tsx              Routes + providers
│   └── main.tsx             Vite entry
├── supabase/
│   └── migrations/0001_vertex_init.sql   10 tables + RLS
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── vite.config.ts
```

## Database schema (10 tables)

| # | Table | Purpose |
|---|-------|---------|
| 1 | `users` | Profile + role mirror of `auth.users` |
| 2 | `projects` | Contract metadata, bonds, insurance, KPI cap |
| 3 | `submissions` | Uploaded documents + processing state |
| 4 | `ai_findings` | AI compliance hits per submission |
| 5 | `comments` | Review threads per submission |
| 6 | `kpi_tracking` | KPI penalty calculations |
| 7 | `mobilization_tracking` | Staffing / deployment status |
| 8 | `obligations` | Deliverables, payments, renewals |
| 9 | `insurance_tracking` | Coverage + expiry alerts |
| 10 | `audit_log` | Append-only audit trail |

All tables have RLS enabled. Helper functions `current_user_role()` /
`is_admin()` keep the policies readable.

## Role hierarchy (RLS)

- **Admin** — full CRUD on every table.
- **Reviewer** — full CRUD only on projects they own (`owner_id = auth.uid()`)
  and rows linked to those projects.
- **Viewer** — `SELECT` only on project-scoped tables.
- **API User** — `SELECT` only (same shape as viewer; intended for programmatic
  read access from automations).

Every authenticated user can read and update their own row in `users`. Every
authenticated user can `INSERT` audit_log rows attributed to themselves.

## Internationalization & RTL

`useRTL` sets `<html dir>` and `<html lang>` from the active i18next language.
Layout flips because the components use CSS Logical Properties
(`inset-inline-start`, `margin-inline-end`, `text-start`, `end-0` etc.) rather
than physical `left`/`right` properties. The Tailwind `tailwindcss-rtl` plugin
provides matching `rtl:` variants where logical properties aren't expressive
enough.

To add a new translation key:

1. Add it to `src/locales/en/common.json` AND `src/locales/ar/common.json`.
2. Use it in a component: `const { t } = useLanguage(); t('your.key')`.

## Testing checklist (Session 1)

Functionality:
- [ ] Login with valid email/password → lands on `/dashboard`
- [ ] Login with wrong password → inline error shown
- [ ] Logout → redirects to `/login`
- [ ] Visiting `/dashboard` while logged out → redirects to `/login`

Bilingual & RTL:
- [ ] Click "العربية" in header → full UI switches to Arabic
- [ ] Sidebar moves to the right edge, navigation flips
- [ ] Form labels right-aligned in Arabic mode
- [ ] Click "English" → switches back, sidebar returns left

Responsiveness:
- [ ] 375px (mobile): sidebar hidden, hamburger visible
- [ ] 768px (tablet): hamburger gone, sidebar pinned, condensed layout
- [ ] 1024px+ (desktop): full sidebar visible (288px wide)
- [ ] All buttons/links ≥44px tall, inputs ≥48px

Accessibility:
- [ ] Tab through login form: logical order, visible focus ring
- [ ] Skip link appears on first Tab press
- [ ] Form labels associated with inputs (`htmlFor`)
- [ ] No console errors

Database:
- [ ] 10 tables visible under Supabase → Table editor
- [ ] RLS enabled (lock icon) on every table
- [ ] Inserting a test user via Supabase Auth seeds `public.users`

## Next steps (Session 2)

- Dashboard widgets (KPIs, traffic-light summary)
- File upload + Supabase Storage wiring
- Claude API integration for AI findings extraction
- Project + submission CRUD UI

## Stack reference

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript 5, Vite 5 |
| Styling | Tailwind 3.4 + tailwindcss-rtl + CSS Logical Properties |
| i18n | i18next + react-i18next |
| Routing | react-router-dom 6 |
| Backend | Supabase (PostgreSQL 15, Auth, Storage) |
| Region | UAE North (me-south-1) |
