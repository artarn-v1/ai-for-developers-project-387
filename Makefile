# ---- Install ----

install:
	npm ci
	cd frontend && npm ci

install-all: install

frontend-install:
	cd frontend && npm ci

api-install:
	npm ci

# ---- Frontend ----

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

frontend-generate-types:
	cd frontend && npm run generate:types

frontend-preview:
	cd frontend && npm run preview

# ---- Mock ----

mock:
	cd frontend && npm run mock

dev-full:
	cd frontend && npm run dev:full

# ---- Backend ----

backend-install:
	cd backend && go mod tidy

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

backend-env:
	cp -n backend/.env.example backend/.env

frontend-env:
	cp -n frontend/.env.example frontend/.env

# ---- API (TypeSpec) ----

api-compile:
	npx tsp compile .

.PHONY: install install-all frontend-install api-install
.PHONY: frontend-dev frontend-build frontend-generate-types frontend-preview
.PHONY: mock dev-full api-compile
.PHONY: backend-install backend-build backend-run backend-lint backend-migrate backend-migrate-create backend-env frontend-env
