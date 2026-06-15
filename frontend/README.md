# Meeting Booking Service — Frontend

React-клиент для сервиса бронирования встреч. Две роли: **администратор** (управление типами встреч) и **клиент** (бронирование слотов).

## Стек

- **Vite 8** — сборщик (алиас `@/` → `src/`)
- **React 19** — UI
- **TypeScript 5.9** — strict mode + `verbatimModuleSyntax`
- **React Router v7** — клиентский роутинг
- **Mantine v9** — UI-компоненты (`@mantine/core`, `@mantine/dates`, `@mantine/form`, `@mantine/hooks`, `@mantine/code-highlight`)
- **TanStack Query v5** — запросы к API
- **dayjs** — работа с датами
- **openapi-typescript** — генерация типов из OpenAPI-спецификации
- **PostCSS** + `postcss-preset-mantine` — стилизация
- **ESLint** + `typescript-eslint` — линтинг
- **@stoplight/prism-cli** — mock-сервер для разработки без бэкенда
- **concurrently** — одновременный запуск mock + dev
- **Docker** + **nginx** — production-сборка

## Структура

```
src/
├── api/
│   ├── client.ts             — HTTP-клиент (fetch + ApiError)
│   ├── admin.ts              — API-вызовы для админки
│   └── user.ts               — API-вызовы для бронирования
├── components/
│   └── CodeBlock.tsx         — подсветка кода (JSON, curl)
├── lib/
│   └── datetime.ts           — утилиты для работы с датами
├── routes/
│   ├── admin/
│   │   ├── AdminLayout.tsx   — layout админки (навигация)
│   │   ├── MeetingTypesPage.tsx — управление типами встреч
│   │   └── MeetingsPage.tsx  — список встреч (подтверждение)
│   ├── client/
│   │   ├── ClientLayout.tsx  — layout бронирования
│   │   ├── MeetingTypesPage.tsx — выбор типа встречи
│   │   └── CalendarPage.tsx  — календарь + бронь слота
│   └── NotFound.tsx          — 404
├── types/
│   └── api.ts                — сгенерированные типы из OpenAPI
├── theme.ts                  — дизайн-токены (COLORS)
├── App.tsx                   — роутинг
├── main.tsx                  — входная точка (QueryClient, MantineProvider)
└── index.css                 — глобальные стили
Dockerfile                    — multi-stage сборка (node → nginx)
nginx.conf                    — прокси /api/ → backend
```

## Роуты

| URL | Страница | Описание |
|-----|----------|----------|
| `/` | — | Редирект на `/admin/demo` |
| `/admin/:adminSlug` | AdminLayout | Layout админки (редирект на `meeting-types`) |
| `/admin/:adminSlug/meeting-types` | MeetingTypesPage | Типы встреч (создание, вкл/выкл) |
| `/admin/:adminSlug/meetings` | MeetingsPage | Список встреч (фильтр, подтверждение/отклонение) |
| `/client/:ownerSlug` | ClientMeetingTypesPage | Типы встреч для бронирования |
| `/client/:ownerSlug/:meetingTypeSlug` | CalendarPage | Календарь и выбор слота |
| `*` | NotFound | 404 |

Примеры:
- `/admin/demo/meeting-types`
- `/admin/john/meetings`
- `/client/john`
- `/client/john/15min`

## Дизайн

Тёмная тема через константы в `theme.ts`:

| Токен | Значение | Назначение |
|-------|----------|------------|
| `bg` | `#18181b` | Фон страницы |
| `cardBg` | `#27272a` | Фон карточек |
| `border` | `#3f3f46` | Границы |
| `text` | `#f4f4f5` | Основной текст |
| `mutedText` | `#a1a1aa` | Второстепенный текст |
| `slotAvailable` | `#22c55e` | Свободный слот |
| `slotOccupied` | `#52525b` | Занятый слот |
| `avatarBg` | `#3f6212` | Фон аватара |
| `inputBg` | `#27272a` | Фон полей ввода |
| `inputBorder` | `#3f3f46` | Граница полей ввода |

## Переменные окружения

| Переменная | По умолчанию | Описание |
|-----------|-------------|----------|
| `VITE_API_URL` | `http://localhost:8080` | Базовый URL API |

Скопируй `.env.example`:

```bash
make frontend-env
cp -n frontend/.env.example frontend/.env
```

## Команды

```bash
# Разработка
make frontend-dev                          # npm run dev (Vite)
make dev-full                              # mock + dev одновременно

# Сборка
make frontend-build                        # tsc -b && vite build
make frontend-preview                      # превью продакшн-сборки

# Генерация типов
make frontend-generate-types               # openapi-typescript → api.ts

# Mock-сервер (без бэкенда)
make mock                                  # Prism на порту 8080

# Линтинг
cd frontend && npm run lint                # ESLint

# Установка зависимостей
make frontend-install                      # npm ci
```

## Docker

```bash
make docker-build              # docker compose build
make docker-up                 # docker compose up -d (nginx + backend + БД)
make docker-down               # docker compose down
```

Dockerfile — multi-stage: сборка статики (node:22-alpine) → nginx.  
`nginx.conf` проксирует `/api/` на бэкенд (http://backend:8080), статика отдаётся напрямую.
```
