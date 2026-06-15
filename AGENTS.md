# AGENTS.md

## Repo layout

| Directory | Stack | Entrypoint |
|-----------|-------|------------|
| root | TypeSpec 1.12 | `main.tsp` → `tsp-output/schema/openapi.yaml` |
| `backend/` | Go 1.26 + chi v5 + sqlx + PostgreSQL | `cmd/server/main.go` |
| `frontend/` | React 19 + Vite 8 + Mantine 9 + TanStack Query 5 | `src/main.tsx` |
| `tests/` | Playwright + TypeScript | `specs/*.spec.ts` |

## Critical workflow

After changing `.tsp` files, run in order:

```bash
make api-compile             # tsp compile . → tsp-output/schema/openapi.yaml
make frontend-generate-types # openapi-typescript → frontend/src/types/api.ts
```

- `tsp-output/` is gitignored — must be regenerated
- `frontend/src/types/api.ts` **is committed** — regenerate after API changes

## Commands

All via `make` (see Makefile for full list). Key ones:

| Target | What it does |
|--------|-------------|
| `make install` | `npm ci` in root + `frontend/` |
| `make api-compile` | `npx tsp compile .` |
| `make frontend-generate-types` | openapi-typescript → `frontend/src/types/api.ts` |
| `make frontend-build` | `tsc -b && vite build` (typecheck + bundle) |
| `make dev-full` | Prism mock (port 8080) + Vite concurrently |
| `make backend-migrate` | Runs `migrate up` — requires `DATABASE_URL` in env |
| `make backend-migrate-create name=<n>` | Creates numbered SQL migration |
| `make mock` | Prism stateless mock on port 8080 |

Frontend lint: `cd frontend && npm run lint`

## First backend startup

```bash
make backend-env        # cp .env.example → .env
make backend-install    # go mod tidy
make backend-migrate    # requires PostgreSQL, reads $DATABASE_URL
make backend-run
```

## Backend quirks

- `godotenv` loads `.env` automatically at startup (`config.go`)
- DB exclusion constraint `meetings_no_overlap` (via `btree_gist`) prevents slot overlap at DB level
- Handler split: `admin_handler.go` + `client_handler.go`
- DI wiring in `cmd/server/main.go`: handler → service → repository/sqlx

## Frontend quirks

- `import type` required (`verbatimModuleSyntax: true`)
- `enum` / `namespace` / parameter properties forbidden (`erasableSyntaxOnly: true`)
- `noEmit: true` — Vite builds, tsc only checks types
- Tsconfig project references: `tsconfig.json` → `tsconfig.app.json` (src) + `tsconfig.node.json` (config)
- `@/` → `src/` (Vite alias)
- API client: `src/api/client.ts` (raw fetch), `src/api/admin.ts` + `src/api/user.ts` (typed via generated types)
- Routes mirror API: `/admin/:adminSlug/*` (management) and `/client/:ownerSlug/*` (booking)

## E2E tests (Playwright)

```bash
make test-e2e-install  # npm ci in tests/
make test-e2e          # docker compose up -d + playwright test
make test-e2e-ui       # same but --ui mode
```

**How it works:** `docker compose up -d` starts PostgreSQL → backend (auto-migrates) → frontend (nginx on port 80 proxying `/api/` to backend). Playwright runs on host against `http://localhost:80`. API helpers (`tests/helpers/api.ts`) talk directly to backend on port 8080.

**Seed data:** Owner `Evgeny` (adminSlug: `evgeny-admin`, clientSlug: `evgeny`, timezone: `Europe/Moscow`) with meeting type «Личное напоминание про масло».

**Requires Chrome:** Playwright uses `channel: 'chromium'`. If missing: `npx playwright install chromium`.

## CI / Branching

- **commitlint** enforces Conventional Commits on PR (scopes: `backend`, `frontend`, `api`, `tests`, `infra`, `deps`, `release`)
- **Pre-commit hook** (husky + lint-staged): eslint on staged TS files, `go vet` on staged Go files
- **Release Please** on main branch — 3 release components (root `v*`, `frontend/v*`, `backend/v*`)
- **E2E** runs on push to main and PRs (builds Docker images, runs Playwright)

## Domain language

See `CONTEXT.md` for full glossary. Core entities: Owner, MeetingType, Participant, Meeting, MeetingParticipant.
