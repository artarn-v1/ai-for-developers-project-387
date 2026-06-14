# AGENTS.md

## Обзор

Meeting Booking Service — монорепозиторий из трёх пакетов:

| Директория | Технологии | Входная точка / назначение |
|-----------|------|----------------------|
| корень | TypeSpec 1.12 | `main.tsp` — спецификация API → OpenAPI 3.1.0 YAML |
| `backend/` | Go 1.26 + chi v5 + sqlx + PostgreSQL | `backend/cmd/server/main.go` |
| `frontend/` | React 19 + Vite + Mantine 9 + TanStack Query 5 + React Router v7 | `frontend/src/main.tsx` |

## Рабочий процесс

```bash
make install              # npm ci в корне + frontend/
make api-compile          # tsp compile . → tsp-output/schema/openapi.yaml
make frontend-generate-types  # openapi-typescript → frontend/src/types/api.ts
make dev-full             # Prism mock (порт 8080) + Vite одновременно
```

**Обязательный порядок** после изменения `.tsp` файлов: `api-compile` → `frontend-generate-types`.

## Команды

| Make target | Эквивалент |
|-------------|-----------|
| `make frontend-dev` | `cd frontend && npm run dev` |
| `make frontend-build` | `cd frontend && npm run build` (сначала `tsc -b`) |
| `make frontend-preview` | `cd frontend && npm run preview` (Vite preview продакшн-сборки) |
| `make mock` | `cd frontend && npx prism mock ../tsp-output/schema/openapi.yaml -p 8080` |
| `make backend-install` | `cd backend && go mod tidy` |
| `make backend-build` | `cd backend && go build ./cmd/server` |
| `make backend-run` | `cd backend && go run ./cmd/server` |
| `make backend-lint` | `cd backend && go vet ./...` |

Только фронтенд: `cd frontend && npm run lint` (ESLint).

## Окружение

- `VITE_API_URL` — базовый URL API (по умолчанию `http://localhost:8080`)
- Vite резолвит импорты `@/` в `frontend/src/`
- Бэкенд: `PORT` (по умолчанию `8080`), `DATABASE_URL` (по умолчанию `postgres://postgres:postgres@localhost:5432/meeting_booking?sslmode=disable`)

## Соглашения по коду

- TypeScript strict mode: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (используй `import type` для импортов только типов)
- `erasableSyntaxOnly: true` — запрещены `enum`, `namespace` (кроме `declare`), parameter properties
- PostCSS с пресетом Mantine (`postcss-preset-mantine`)
- ESLint с `typescript-eslint` strict + плагин `react-refresh`
- Сгенерированный файл типов `frontend/src/types/api.ts` закоммичен; перегенерируй после изменений API

## Особенности проекта

- **В проекте нет тестов** — ни одной тестовой зависимости или скрипта. При добавлении функционала тесты нужно писать с нуля.
- **Prism mock-сервер не сохраняет состояние** между запросами. Любые созданные данные живут только в рамках одного запроса.
- **TypeScript использует project references** (`tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`). `tsc -b` собирает оба.
- **Бэкенд требует PostgreSQL** — применить миграции: `migrate -path backend/migrations -database "$DATABASE_URL" up`.

## Архитектура

- **TypeSpec модели** (`models/*.tsp`) описывают сущности в пространстве имён `MeetingBooking`
- **TypeSpec API** (`apis/admin.tsp`, `apis/user.tsp`) определяют роуты `/admin/{adminSlug}` и `/client/{ownerSlug}`
- **API-клиенты фронтенда** в `frontend/src/api/` используют сгенерированные из OpenAPI типы
- **Роуты** зеркалируют API: `/admin/:adminSlug/*` (управление) и `/client/:ownerSlug/*` (бронирование)
- **Бэкенд** (`backend/`): Go 1.26, chi v5, sqlx + PostgreSQL, миграции в `backend/migrations/`
- **Доменный язык** описан в `CONTEXT.md` — читать для понимания терминов (Owner, MeetingType, Participant, Meeting)
