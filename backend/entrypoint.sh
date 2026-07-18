#!/bin/sh
set -e
if [ -n "$DATABASE_URL" ]; then
    echo "Running migrations..."
    migrate -path /app/migrations -database "$DATABASE_URL" up
fi
echo "Starting server..."
exec ./server
