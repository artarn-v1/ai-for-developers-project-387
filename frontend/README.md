# frontend

## Стек

- **Vite** — сборщик
- **React 19** — UI-библиотека
- **TypeScript** — типизация
- **React Router v7** — клиентский роутинг
- **Mantine v9** — UI-компоненты
- **TanStack Query v5** — работа с API

## Команды

```bash
npm run dev          # запустить dev-сервер
npm run build        # продакшн билд
npm run preview      # превью билда локально
npm run lint         # ESLint
npm run mock         # Prism mock-сервер (localhost:8080)
npm run dev:full     # dev-сервер + mock (concurrently)
npm run generate:types  # генерация типов из OpenAPI
```

## Роуты

| URL | Страница | Описание |
|-----|----------|----------|
| `/` | — | Редирект на `/admin/demo` |
| `/admin/:adminSlug` | — | Layout админки → `/admin/:adminSlug/meeting-types` |
| `/admin/:adminSlug/meeting-types` | MeetingTypesPage | Типы встреч |
| `/admin/:adminSlug/meetings` | MeetingsPage | Список встреч |
| `/client/:ownerSlug` | ClientMeetingTypesPage | Типы встреч для бронирования |
| `/client/:ownerSlug/:meetingTypeSlug/book` | BookingPage | Форма бронирования |

Примеры:

- `/admin/demo/meeting-types`
- `/admin/john/meetings`
- `/client/john`
- `/client/john/15min/book`
