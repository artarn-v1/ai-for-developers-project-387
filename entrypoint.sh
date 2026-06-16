#!/bin/sh
set -e

export BACKEND_PORT=${BACKEND_PORT:-8081}

envsubst '${PORT} ${BACKEND_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

if [ -n "$DATABASE_URL" ]; then
    echo "Running migrations..."
    migrate -path /app/migrations -database "$DATABASE_URL" up
fi

echo "Starting backend on port $BACKEND_PORT..."
PORT=$BACKEND_PORT /app/server &

echo "Starting nginx on port $PORT..."
nginx -g "daemon off;"
