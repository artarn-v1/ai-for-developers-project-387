# frontend

## Стек

- **Vite** — сборщик (алиас `@/` → `src/`)
- **React 19** — UI-библиотека
- **TypeScript** — типизация (strict mode)
- **React Router v7** — клиентский роутинг
- **Mantine v9** — UI-компоненты (+ `@mantine/dates`, `@mantine/form`, `@mantine/hooks`, `@mantine/code-highlight`)
- **TanStack Query v5** — работа с API
- **dayjs** — работа с датами
- **PostCSS** + `postcss-preset-mantine` — стилизация
- **openapi-typescript** — генерация типов из OpenAPI

## Архитектура

```
src/
├── api/            # API-клиенты (admin.ts, client.ts, user.ts)
├── components/     # Переиспользуемые компоненты (CodeBlock.tsx)
├── lib/            # Утилиты (datetime.ts)
├── routes/
│   ├── admin/      # Страницы админки
│   └── client/     # Страницы бронирования
├── types/          # Сгенерированные типы API (api.ts)
├── theme.ts        # Дизайн-токены (COLORS)
├── App.tsx         # Роутинг
└── main.tsx        # Входная точка
```

## Переменные окружения

- `VITE_API_URL` — базовый URL API (по умолчанию `http://localhost:8080`)

## Команды

```bash
npm run dev              # запустить dev-сервер
npm run build            # tsc -b && vite build
npm run preview          # превью билда локально
npm run lint             # ESLint
npm run mock             # Prism mock-сервер (localhost:8080)
npm run dev:full         # dev-сервер + mock (concurrently)
npm run generate:types   # генерация типов из OpenAPI → src/types/api.ts
```

## Роуты

| URL | Страница | Описание |
|-----|----------|----------|
| `/` | — | Редирект на `/admin/demo` |
| `/admin/:adminSlug` | AdminLayout → редирект на `meeting-types` | Layout админки |
| `/admin/:adminSlug/meeting-types` | MeetingTypesPage | Типы встреч (управление) |
| `/admin/:adminSlug/meetings` | MeetingsPage | Список встреч (подтверждение/отклонение) |
| `/client/:ownerSlug` | ClientLayout → ClientMeetingTypesPage | Типы встреч для бронирования |
| `/client/:ownerSlug/:meetingTypeSlug` | CalendarPage | Календарь и выбор слота |
| `*` | NotFound | 404 |

Примеры:

- `/admin/demo/meeting-types`
- `/admin/john/meetings`
- `/client/john`
- `/client/john/15min`
