#!/bin/sh
set -e

cd /var/www/html

if [ ! -f vendor/autoload.php ]; then
  echo "[soko-backend] Installing Composer dependencies..."
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Ensure storage permissions for the FPM user
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
chmod -R ug+rwx storage bootstrap/cache 2>/dev/null || true

exec "$@"
