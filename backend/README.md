# Meeting Booking Service — Backend

Go-реализация API для сервиса бронирования встреч. Спецификация API — TypeSpec (`../main.tsp`).

## Технологии

- **Язык:** Go 1.26
- **HTTP:** `chi` v5
- **БД:** PostgreSQL + `sqlx` + `golang-migrate`
- **Конфигурация:** `godotenv` (`.env`)
- **CORS:** `chi/cors`

## Структура

```
cmd/server/main.go             — точка входа, DI
internal/
  config/config.go             — конфигурация из env/.env
  handler/
    handler.go                 — HTTP handlers (Admin + Client)
    helpers.go                 — утилиты (JSON, UUID, парсинг)
    response.go                — DTO и request/response типы
  model/model.go               — доменные модели
  repository/
    interfaces.go              — интерфейсы репозиториев
    sqlx/
      owner.go                 — OwnerRepo (sqlx)
      meeting_type.go          — MeetingTypeRepo (sqlx)
      meeting.go               — MeetingRepo (sqlx)
      meeting_participant.go   — MeetingParticipantRepo (sqlx)
      participant.go           — ParticipantRepo (sqlx)
  service/meeting.go           — бизнес-логика (слоты, бронь)
migrations/
  000001_init.up/down.sql      — создание таблиц
  000002_seed.up.sql           — сид-данные
.env.example                   — шаблон переменных окружения
```

## API

### Admin (`/admin/{adminSlug}`)

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/` | Профиль владельца (name, clientSlug, timeZone) |
| `GET` | `/meeting-types` | Список типов встреч |
| `POST` | `/meeting-types` | Создать тип встречи |
| `PATCH` | `/meeting-types/{meetingTypeId}` | Вкл/выкл тип |
| `GET` | `/meetings` | Список встреч (фильтры: `dateStartFrom`, `dateStartTo`, `isConfirmed`, `meetingTypeId`) |
| `PATCH` | `/meetings/{meetingId}` | Подтвердить/отклонить встречу |

### Client (`/client/{ownerSlug}`)

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/meeting-types` | Только активные типы встреч |
| `GET` | `/meeting-types/{meetingTypeSlug}` | Тип встречи по slug |
| `GET` | `/meeting-types/{meetingTypeSlug}/meetings` | Занятые слоты |
| `POST` | `/meeting-types/{meetingTypeSlug}/meetings` | Создать бронь |

### System

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/health-check` | Health check (ping БД) |

## База данных

**Таблицы:** `owners`, `meeting_types`, `participants`, `meetings`, `meeting_participants`.

Связи:
- `meeting_types(M)` → `owners(1)` — типы встреч принадлежат владельцу
- `meetings(M)` → `meeting_types(1)` — встречи привязаны к типу
- `meeting_participants(M)` ↔ `meetings(M)` ↔ `participants(M)` — участники many-to-many

## Переменные окружения

| Переменная | По умолчанию | Описание |
|-----------|-------------|----------|
| `PORT` | `8080` | Порт сервера |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/meeting_booking?sslmode=disable` | Подключение к БД |

Файл `.env` загружается автоматически (`godotenv.Load`). Скопируй `.env.example`:

```bash
make backend-env
cp -n backend/.env.example backend/.env
```

## Разработка

```bash
make backend-install           # go mod tidy
make backend-env               # скопировать .env

# Применить миграции
make backend-migrate           # migrate -path migrations -database "$DATABASE_URL" up

# Запустить
make backend-run               # go run ./cmd/server

# Собрать бинарник
make backend-build             # go build ./cmd/server

# Проверить код
make backend-lint              # go vet ./...
```

## Создание миграций

```bash
make backend-migrate-create name=<name>
```

Эквивалент: `migrate create -ext sql -dir migrations -seq <name>`.
