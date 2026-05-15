# Baby Letters — Site da Tatuadora

Site de portfólio e captação de clientes para Brhenda Rodrigues (@baby.letters), tatuadora especializada em lettering, Jundiaí SP.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/baby-letters run dev` — run the front-end site
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter (routing) + TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/baby-letters/src/` — Frontend React app
  - `pages/Admin.tsx` — Admin panel (password: 1234)
  - `components/Gallery.tsx` — Fetches portfolio from /api/portfolio
  - `components/Testimonials.tsx` — Fetches from /api/testimonials
- `artifacts/api-server/src/routes/` — API routes
  - `testimonials.ts` — CRUD for testimonials
  - `portfolio.ts` — CRUD for portfolio items
- `lib/db/src/schema/` — DB schemas (testimonials.ts, portfolio.ts)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for codegen)

## Architecture decisions

- Admin auth uses a simple `x-admin-password` HTTP header checked against `ADMIN_PASSWORD` env var (default: "1234")
- Portfolio photos are URL-based (admin pastes image URLs) — no file upload needed
- Testimonials and Gallery components have hardcoded fallback data if DB is empty
- `lang="pt-BR" translate="no"` on index.html prevents Chrome auto-translation

## Product

- Hero section with Brhenda's profile photo and Instagram link
- Interactive WhatsApp chatbot (3-step quote flow)
- Portfolio gallery (fetches from DB, fallback to stock images)
- Testimonials section (fetches from DB, fallback to defaults)
- Admin panel at /admin with tabs: Depoimentos + Portfólio

## User preferences

- WhatsApp: 5511982656845
- Instagram: @baby.letters
- Admin password: 1234

## Gotchas

- Profile photo: artifacts/baby-letters/public/brhenda-profile.jpg
- Workflows may show EADDRINUSE if restarted too quickly — kill with `fuser -k 8080/tcp 25467/tcp` first
- Always run `pnpm --filter @workspace/db run push` after adding new DB schema tables

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
