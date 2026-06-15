# Meeting Booking Service — E2E Tests

Playwright-тесты для сервиса бронирования встреч. Покрывают сценарии админки и бронирования.

## Стек

- **Playwright** — E2E-тестирование
- **TypeScript** — strict mode + `verbatimModuleSyntax`
- **ESLint** + `typescript-eslint` — линтинг

## Структура

```
specs/
├── admin-meeting-types.spec.ts  — создание/вкл/выкл типов встреч
├── client-booking.spec.ts       — бронирование слотов клиентом
└── full-e2e.spec.ts             — полный сценарий (admin → client)
helpers/
└── api.ts                       — HTTP-helper для прямой работы с API
playwright.config.ts             — конфигурация Playwright
tsconfig.json                    — конфигурация TypeScript
eslint.config.js                 — конфигурация ESLint
```

## Запуск

Перед запуском тестов убедись, что Chrome установлен (`which google-chrome-stable`).

```bash
make test-e2e-install            # npm ci в tests/
make test-e2e                    # docker compose up -d + playwright test
make test-e2e-ui                 # docker compose up -d + playwright test --ui
make test-e2e-report             # playwright show-report

# Только установка браузера (если нет Chrome)
npx playwright install chromium
```

## Как это работает

1. `docker compose up -d` поднимает PostgreSQL + бэкенд (с миграциями и seed) + фронтенд (nginx на порту 80)
2. Playwright запускается на хосте, ходит на `http://localhost:80`
3. API-хелперы (`helpers/api.ts`) работают напрямую с бэкендом на порту 8080

## Seed-данные

| Поле | Значение |
|------|----------|
| Owner | Evgeny |
| adminSlug | `evgeny-admin` |
| clientSlug | `evgeny` |
| timezone | Europe/Moscow |
| Тип встречи | Личное напоминание про масло |
