# AGENTS.md

## Обзор

Meeting Booking Service — монорепозиторий из трёх пакетов:

| Директория | Технологии | Входная точка |
|-----------|------|----------------------|
| корень | TypeSpec 1.12 | `main.tsp` → OpenAPI 3.1.0 YAML |
| `backend/` | Go 1.26 + chi v5 + sqlx + PostgreSQL | `cmd/server/main.go` |
| `frontend/` | React 19 + Vite + Mantine 9 + TanStack Query 5 + React Router v7 | `src/main.tsx` |

## Рабочий процесс

```bash
make install                 # npm ci в корне + frontend/
make api-compile             # tsp compile . → tsp-output/schema/openapi.yaml
make frontend-generate-types # openapi-typescript → frontend/src/types/api.ts
```

**Обязательный порядок** после изменения `.tsp`: `api-compile` → `frontend-generate-types`.

`tsp-output/` в `.gitignore` — каталог не закоммичен, всегда генерируй с `make api-compile`.

```bash
make dev-full                # Prism mock (порт 8080) + Vite одновременно
```

## Команды

### TypeSpec

| Make target | Эквивалент |
|-------------|-----------|
| `make api-install` | `npm ci` (в корне) |
| `make api-compile` | `npx tsp compile .` → `tsp-output/schema/openapi.yaml` |

### Frontend

| Make target | Эквивалент |
|-------------|-----------|
| `make frontend-install` | `cd frontend && npm ci` |
| `make frontend-env` | `cp -n frontend/.env.example frontend/.env` |
| `make frontend-dev` | `cd frontend && npm run dev` |
| `make frontend-build` | `cd frontend && npm run build` (`tsc -b && vite build`) |
| `make frontend-preview` | `cd frontend && npm run preview` |
| `make frontend-generate-types` | `cd frontend && npm run generate:types` |
| `make mock` | `cd frontend && npm run mock` (Prism stateless, 8080) |
| `make dev-full` | `cd frontend && npm run dev:full` (mock + dev параллельно) |

ESLint: `cd frontend && npm run lint` (в Makefile нет).

### Backend

| Make target | Эквивалент |
|-------------|-----------|
| `make backend-install` | `cd backend && go mod tidy` |
| `make backend-env` | `cp -n backend/.env.example backend/.env` |
| `make backend-build` | `cd backend && go build ./cmd/server` |
| `make backend-run` | `cd backend && go run ./cmd/server` |
| `make backend-lint` | `cd backend && go vet ./...` |
| `make backend-migrate` | `cd backend && migrate -path migrations -database "$(DATABASE_URL)" up` |
| `make backend-migrate-create name=<name>` | `cd backend && migrate create -ext sql -dir migrations -seq <name>` |

`backend-migrate` читает `DATABASE_URL` из окружения (через `$(DATABASE_URL)`). Перед запуском убедись, что БД доступна и переменная установлена.

### Docker

| Make target | Эквивалент |
|-------------|-----------|
| `make docker-build` | `docker compose build` |
| `make docker-up` | `docker compose up -d` |
| `make docker-down` | `docker compose down` |
| `make docker-logs` | `docker compose logs -f` |
| `make docker-restart` | `docker compose down && docker compose up -d` |

### Common

| Make target | Эквивалент |
|-------------|-----------|
| `make install` | `npm ci` в корне + `cd frontend && npm ci` |

## Окружение

| Переменная | По умолчанию | Где |
|-----------|-------------|-----|
| `VITE_API_URL` | `http://localhost:8080` | `frontend/.env` |
| `PORT` | `8080` | `backend/.env` |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/meeting_booking?sslmode=disable` | `backend/.env` |

Первый запуск бэкенда:
```bash
make backend-env          # скопировать .env
make backend-install      # go mod tidy
make backend-migrate      # применить миграции
make backend-run
```

Vite резолвит `@/` → `frontend/src/`.

## Миграции

Требуют CLI: `migrate` из `golang-migrate/migrate`.

## Соглашения по коду

- **TypeScript strict mode**: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (используй `import type` для типов)
- **`erasableSyntaxOnly: true`**: запрещены `enum`, `namespace` (кроме `declare`), parameter properties
- **`noEmit: true`**: `tsc` только проверяет типы, сборку делает Vite
- **Project references**: `tsconfig.json` → `tsconfig.app.json` (src/) + `tsconfig.node.json` (vite.config.ts)
- **PostCSS**: `postcss-preset-mantine`
- **ESLint**: `typescript-eslint` strict + `react-refresh`
- **Сгенерированный `frontend/src/types/api.ts`** закоммичен; перегенерируй после изменений API

## Особенности проекта

- **Нет тестов** — при добавлении писать с нуля.
- **Prism mock stateless** — данные живут только в рамках одного запроса.
- **Бэкенд требует PostgreSQL** — миграции через `golang-migrate`.
- **godotenv** — загружает `.env` автоматически при старте бэкенда (`config.go`).

## Архитектура

- **TypeSpec**: `models/{owner,meeting-type,participant,meeting}.tsp` (namespace `MeetingBooking`) + `apis/admin.tsp` (namespace `Admin`) + `apis/user.tsp` (namespace `Client`)
- **API-клиенты фронтенда** (`src/api/admin.ts`, `src/api/user.ts`) используют сгенерированные из OpenAPI типы; `src/api/client.ts` — общий HTTP-helper (fetch)
- **Роуты** зеркалируют API: `/admin/:adminSlug/*` (управление) и `/client/:ownerSlug/*` (бронирование)
- **Бэкенд**: handler → service → repository/sqlx; DI в `main.go`
- **Доменный язык**: `CONTEXT.md` — Owner, MeetingType, Participant, Meeting
