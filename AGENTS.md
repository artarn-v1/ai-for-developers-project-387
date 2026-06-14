# AGENTS.md

## Обзор

Meeting Booking Service — монорепозиторий из двух пакетов:

| Директория | Технологии | Входная точка / назначение |
|-----------|------|----------------------|
| корень | TypeSpec 1.12 | `main.tsp` — спецификация API → OpenAPI 3.1.0 YAML |
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
| `make mock` | `cd frontend && npx prism mock ../tsp-output/schema/openapi.yaml -p 8080` |

Только фронтенд: `cd frontend && npm run lint` (ESLint).

## Окружение

- `VITE_API_URL` — базовый URL API (по умолчанию `http://localhost:8080`)
- Vite резолвит импорты `@/` в `frontend/src/`

## Соглашения по коду

- TypeScript strict mode: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (используй `import type` для импортов только типов)
- PostCSS с пресетом Mantine (`postcss-preset-mantine`)
- ESLint с `typescript-eslint` strict + плагин `react-refresh`
- Сгенерированный файл типов `frontend/src/types/api.ts` закоммичен; перегенерируй после изменений API

## Архитектура

- **TypeSpec модели** (`models/*.tsp`) описывают сущности в пространстве имён `MeetingBooking`
- **TypeSpec API** (`apis/admin.tsp`, `apis/user.tsp`) определяют роуты `/admin/{adminSlug}` и `/client/{ownerSlug}`
- **API-клиенты фронтенда** в `frontend/src/api/` используют сгенерированные из OpenAPI типы
- **Роуты** зеркалируют API: `/admin/:adminSlug/*` (управление) и `/client/:ownerSlug/*` (бронирование)
