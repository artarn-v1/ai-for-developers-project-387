# ---- Stage 1: Frontend build ----
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Stage 2: Backend build ----
FROM golang:1.26-alpine AS backend-builder
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

# ---- Stage 3: Migrate binary ----
FROM migrate/migrate AS migrate

# ---- Stage 4: Runtime ----
FROM nginx:alpine
RUN apk --no-cache add ca-certificates

WORKDIR /app
COPY --from=backend-builder /app/server .
COPY --from=backend-builder /app/migrations ./migrations
COPY --from=migrate /usr/local/bin/migrate /usr/local/bin/migrate
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

COPY deploy/nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY deploy/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
