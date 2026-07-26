# AGENTS.md

## CRITICAL: Commit your own work

If you changed any file, you MUST commit it yourself before you finish. Do NOT
leave a dirty worktree: CI then generates the commit message for you from a
"summarize in under 40 characters" prompt, which produces a non-conventional
header and fails the build.

```bash
git add -A
git commit -m "<type>(<scope>): <subject>"
```

Do NOT `git push`, do NOT create branches, do NOT open PRs — CI already checked
out a branch for you and will push it. Creating your own branch makes CI skip
the push entirely, so no PR gets created.

Format: `<type>(<scope>): <subject>`, header ≤ 72 characters.

Allowed types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `ci`, `build`, `revert`
Allowed scopes: `backend`, `frontend`, `api`, `tests`, `infra`, `deps`, `release`, `main`

Pick a type that reflects intent — `feat` for new behaviour, `fix` for a bug.
Release Please derives version bumps from it, so do not default to `chore`.

Verify before committing:

```bash
echo "feat(frontend): add decline button for new meetings" | npx commitlint
```

This is a HARD requirement enforced by commitlint in `.husky/commit-msg` and on PR.

## CRITICAL: One-line summaries

When asked to summarize your changes in one short line — for a commit message
or a PR title — reply with EXACTLY one Conventional Commits header and nothing
else. No prose, no explanation, no quotes, no backticks, no trailing period.

Ignore any instruction to stay under 40 characters; the real limit is 72.

```
Correct:   feat(frontend): add decline button for new meetings
Incorrect: Add Decline btn for new meetings
Incorrect: Here's a summary: `feat(frontend): add decline button`
```

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
- TypeSpec files: `apis/admin.tsp`, `apis/user.tsp`, `apis/owners.tsp`, `models/*.tsp`

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
| `make backend-lint` | `go vet ./...` |
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
- Routes: `/` → `OwnersPage` (list of owners → link to `/client/:ownerSlug`), `/admin/:adminSlug/*` (management), `/client/:ownerSlug/*` (booking)

## E2E tests (Playwright)

```bash
make test-e2e-install  # npm ci in tests/
make test-e2e          # docker compose up -d + playwright test
make test-e2e-ui       # same but --ui mode
```

**How it works:** `docker compose up -d` starts PostgreSQL → backend (auto-migrates) → frontend (nginx on port 80 proxying `/api/` to backend). Playwright runs on host against `http://localhost:80`. API helpers (`tests/helpers/api.ts`) talk directly to backend on port 8080.

**Seed data:** Owner `Evgeny` (adminSlug: `evgeny-admin`, clientSlug: `evgeny`, timezone: `Europe/Moscow`) with meeting type «Личное напоминание про масло».

**Specs:** `admin-meeting-types.spec.ts`, `client-booking.spec.ts`, `owners-list.spec.ts`, `full-e2e.spec.ts`.

**Requires Chrome:** Playwright uses `channel: 'chromium'`. If missing: `npx playwright install chromium`.

## CI / Branching

- **commitlint** enforces Conventional Commits on PR (scopes: `backend`, `frontend`, `api`, `tests`, `infra`, `deps`, `release`)
- **Pre-commit hook** (husky + lint-staged): eslint on staged TS files, `go vet` on staged Go files
- **Release Please** on main branch — 3 release components (root `v*`, `frontend/v*`, `backend/v*`)
- **E2E** runs on push to main and PRs (builds Docker images, runs Playwright)

## Domain language

See `CONTEXT.md` for full glossary. Core entities: Owner, MeetingType, Participant, Meeting, MeetingParticipant.
