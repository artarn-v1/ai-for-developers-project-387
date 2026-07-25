### Hexlet tests and linter status:
[![Actions Status](https://github.com/artarn-v1/ai-for-developers-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/artarn-v1/ai-for-developers-project-387/actions)
[![E2E Tests](https://github.com/artarn-v1/ai-for-developers-project-387/actions/workflows/e2e.yml/badge.svg)](https://github.com/artarn-v1/ai-for-developers-project-387/actions/workflows/e2e.yml)

# Meeting Booking Service

Сервис для бронирования встреч. Владелец (Owner) создаёт типы встреч (MeetingType) со своим расписанием, клиенты бронируют слоты.

## Стек

| Компонент | Технологии |
|-----------|------------|
| **API (TypeSpec)** | TypeSpec 1.12 → OpenAPI |
| **Бэкенд** | Go 1.26 + chi v5 + sqlx + PostgreSQL |
| **Фронтенд** | React 19 + Vite 8 + Mantine 9 + TanStack Query 5 |
| **Тесты** | Playwright + TypeScript |
| **CI/CD** | GitHub Actions + Release Please |

## Структура проекта

```
.
├── apis/              # TypeSpec-описания API (admin.tsp, user.tsp, owners.tsp)
├── models/            # TypeSpec-модели
├── backend/           # Go-сервер
│   ├── cmd/server/    # Точка входа
│   ├── internal/      # Хендлеры, сервисы, репозитории
│   └── migrations/    # SQL-миграции
├── frontend/          # React-приложение
│   └── src/
│       ├── api/       # HTTP-клиент (сгенерированные типы)
│       ├── components/
│       ├── pages/     # OwnersPage, AdminPanel, ClientBooking
│       └── routes/
├── tests/             # Playwright e2e-тесты
│   └── specs/
├── main.tsp           # Корневой TypeSpec-файл
├── Makefile           # Основные команды
└── docker-compose.yml # Полный стек для локального запуска
```

## Быстрый запуск (mock-режим)

Без PostgreSQL, с эмуляцией API через Prism:

```bash
make install       # Установка зависимостей
make dev-full      # Prism mock (порт 8080) + Vite (порт 5173)
```

## Полный локальный запуск (Docker Compose)

Поднимает PostgreSQL, бэкенд (автомиграция), фронтенд:

```bash
docker compose up -d
```

Приложение доступно на `http://localhost:80`.

## Запуск бэкенда вручную

```bash
make backend-env             # cp .env.example → .env
make backend-install         # go mod tidy
make backend-migrate         # применить миграции (требуется PostgreSQL)
make backend-run             # запустить сервер
```

## Основные команды

| Команда | Описание |
|---------|----------|
| `make install` | Установка npm-зависимостей (root + frontend) |
| `make api-compile` | Компиляция TypeSpec → OpenAPI |
| `make frontend-generate-types` | Генерация TS-типов из OpenAPI |
| `make frontend-build` | Typecheck + Vite build |
| `make backend-lint` | `go vet ./...` |
| `make mock` | Prism stateless mock на порту 8080 |
| `make test-e2e` | Запуск Playwright e2e-тестов |

## Доменная модель

- **Owner** — владелец сервиса, управляет типами встреч. Имеет `adminSlug` (админка) и `clientSlug` (публичная страница).
- **MeetingType** — тип встречи: название, описание, время доступности, длительность, активность.
- **Participant** — участник со стороны клиента (имя, email).
- **Meeting** — забронированный слот: время начала, статус подтверждения, участники.
- **MeetingParticipant** — связь многие-ко-многим между Meeting и Participant.

## E2E-тесты

```bash
make test-e2e-install   # установка Playwright
make test-e2e           # docker compose up -d + playwright test
make test-e2e-ui        # то же с UI-режимом
```

Seed-данные: владелец `Evgeny` (Europe/Moscow) с типом встречи «Личное напоминание про масло».
