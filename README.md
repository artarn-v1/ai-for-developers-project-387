# Meeting Booking Service

Сервис для бронирования встреч. Владелец создаёт типы встреч со своим расписанием, клиенты бронируют свободные слоты.

## Tech Stack

| Component | Stack |
|-----------|-------|
| API spec | TypeSpec 1.12 → OpenAPI 3.0 |
| Backend | Go 1.26 + chi v5 + sqlx + PostgreSQL |
| Frontend | React 19 + Vite 8 + Mantine 9 + TanStack Query 5 |
| E2E tests | Playwright + TypeScript |

## Quick Start (Docker)

```bash
docker compose up -d
```

Opens:
- Frontend: http://localhost:80
- Backend API: http://localhost:8080

## Development (without Docker)

### 1. Install dependencies

```bash
make install
```

### 2. Mock mode (frontend only, no PostgreSQL needed)

```bash
make mock        # Prism mock API on :8080 + Vite dev on :5173
```

Or run both together:

```bash
make dev-full    # same as above
```

### 3. Full backend setup

```bash
make backend-env                        # copy .env.example → .env
make backend-install                    # go mod tidy
# Start PostgreSQL, then:
make backend-migrate                    # run migrations
make backend-run                        # start server on :8080
```

In another terminal:

```bash
make frontend-env                       # copy .env.example → .env
make frontend-dev                       # Vite dev server on :5173
```

## Project Structure

```
├── apis/               # TypeSpec API definitions (admin, user, owners)
├── models/             # TypeSpec data models
├── main.tsp            # TypeSpec entrypoint
├── backend/
│   ├── cmd/server/     # Go entrypoint
│   ├── migrations/     # SQL migrations
│   ├── internal/       # handlers, services, repositories
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/        # API client (fetch, typed)
│   │   ├── components/ # UI components
│   │   ├── pages/      # Route pages
│   │   └── types/      # Generated TypeScript types
│   └── .env.example
├── tests/              # Playwright E2E tests
└── docker-compose.yml
```

After changing `.tsp` files:

```bash
make api-compile             # regenerate OpenAPI spec
make frontend-generate-types # regenerate TypeScript types
```

## Available Commands

| Target | Description |
|--------|-------------|
| `make install` | Install all dependencies |
| `make api-compile` | Compile TypeSpec → OpenAPI |
| `make frontend-generate-types` | Regenerate TS types from OpenAPI |
| `make frontend-build` | Typecheck + bundle frontend |
| `make backend-lint` | `go vet ./...` |
| `make mock` | Prism mock + Vite dev |
| `make dev-full` | Same as `mock` |
| `make docker-up` | `docker compose up -d` |
| `make test-e2e` | Run Playwright tests |

## Testing

```bash
make test-e2e    # docker compose up -d + playwright test
make test-e2e-ui # same but with Playwright UI mode
```

Requires Chromium: `npx playwright install chromium`.

## CI

- Conventional Commits enforced via commitlint
- Pre-commit: eslint + go vet on staged files
- E2E tests on push to main and PRs
- Release Please for versioning (root, frontend, backend)

### Hexlet tests and linter status:
[![Actions Status](https://github.com/artarn-v1/ai-for-developers-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/artarn-v1/ai-for-developers-project-387/actions)
[![E2E Tests](https://github.com/artarn-v1/ai-for-developers-project-387/actions/workflows/e2e.yml/badge.svg)](https://github.com/artarn-v1/ai-for-developers-project-387/actions/workflows/e2e.yml)
