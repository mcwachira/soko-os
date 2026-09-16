#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "==> Waiting for postgres..."
until docker compose exec -T postgres pg_isready -U soko -d soko_os >/dev/null 2>&1; do
  sleep 1
done

echo "==> Waiting for backend..."
until docker compose exec -T backend php -v >/dev/null 2>&1; do
  sleep 1
done

echo "==> Migrating..."
docker compose exec -T backend php artisan migrate --force

echo "==> Done."
