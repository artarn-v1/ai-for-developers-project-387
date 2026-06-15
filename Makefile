# ---- Common ----

install:
	npm ci
	cd frontend && npm ci

install-all: install

# ---- TypeScript ----

api-install:
	npm ci

api-compile:
	npx tsp compile .

# ---- Frontend ----

frontend-install:
	cd frontend && npm ci

frontend-env:
	cp -n frontend/.env.example frontend/.env

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

frontend-preview:
	cd frontend && npm run preview

frontend-generate-types:
	cd frontend && npm run generate:types

mock:
	cd frontend && npm run mock

dev-full:
	cd frontend && npm run dev:full

# ---- Backend ----

backend-install:
	cd backend && go mod tidy

backend-env:
	cp -n backend/.env.example backend/.env

backend-build:
	cd backend && go build ./cmd/server

backend-run:
	cd backend && go run ./cmd/server

backend-lint:
	cd backend && go vet ./...

backend-migrate:
	cd backend && migrate -path migrations -database "$(DATABASE_URL)" up

backend-migrate-create:
	cd backend && migrate create -ext sql -dir migrations -seq $(name)

# ---- Docker ----

docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-restart: docker-down docker-up

.PHONY: install install-all
.PHONY: api-install api-compile
.PHONY: frontend-install frontend-env frontend-dev frontend-build frontend-preview frontend-generate-types mock dev-full
.PHONY: backend-install backend-env backend-build backend-run backend-lint backend-migrate backend-migrate-create
.PHONY: docker-build docker-up docker-down docker-logs docker-restart
