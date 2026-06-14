# Meeting Booking Service — Backend

Go-реализация API для сервиса бронирования встреч. Спецификация API — TypeSpec (`../main.tsp`).

## Технологии

- **Язык:** Go 1.26
- **HTTP:** `chi` v5
- **БД:** PostgreSQL + `sqlx` + `golang-migrate`
- **CORS:** `chi/cors`

## Структура

```
cmd/server/main.go          — точка входа, DI
internal/
  config/config.go          — конфигурация из env
  handler/                  — HTTP handlers + DTO
  model/model.go            — доменные модели
  repository/
    interfaces.go           — интерфейсы репозиториев
    sqlx/                   — реализации на sqlx
  service/meeting.go        — бизнес-логика
migrations/                 — golang-migrate
```

## API

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/health-check` | Health check |
| | **Admin** (`/admin/{adminSlug}`) | |
| `GET` | `/meeting-types` | Список типов встреч |
| `POST` | `/meeting-types` | Создать тип встречи |
| `PATCH` | `/meeting-types/{id}` | Вкл/выкл тип |
| `GET` | `/meetings` | Список встреч (с фильтрацией) |
| `PATCH` | `/meetings/{id}` | Подтвердить/отклонить |
| | **Client** (`/client/{ownerSlug}`) | |
| `GET` | `/meeting-types` | Активные типы встреч |
| `GET` | `/meeting-types/{slug}` | Тип встречи по slug |
| `GET` | `/meeting-types/{slug}/meetings` | Занятые слоты |
| `POST` | `/meeting-types/{slug}/meetings` | Создать бронь |

## Переменные окружения

| Переменная | По умолчанию | Описание |
|-----------|-------------|----------|
| `PORT` | `8080` | Порт сервера |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/meeting_booking?sslmode=disable` | Подключение к БД |

## Разработка

```bash
# Установить зависимости
go mod tidy

# Применить миграции
migrate -path migrations -database "$DATABASE_URL" up

# Запустить
make backend-run          # или: go run ./cmd/server

# Собрать бинарник
make backend-build        # или: go build ./cmd/server

# Проверить код
make backend-lint         # или: go vet ./...
```

## Создание миграций

```bash
migrate create -ext sql -dir migrations -seq <name>
```
