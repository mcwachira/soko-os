FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    bash \
    curl \
    git \
    icu-dev \
    libpq-dev \
    libzip-dev \
    linux-headers \
    oniguruma-dev \
    postgresql-client \
    $PHPIZE_DEPS \
    && docker-php-ext-configure intl \
    && docker-php-ext-install -j$(nproc) \
        bcmath \
        intl \
        opcache \
        pcntl \
        pdo_pgsql \
        pgsql \
        zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS \
    && rm -rf /tmp/pear

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY infrastructure/docker/php/php.ini /usr/local/etc/php/conf.d/99-soko.ini
COPY infrastructure/docker/php/entrypoint.sh /usr/local/bin/soko-entrypoint
RUN chmod +x /usr/local/bin/soko-entrypoint

ENTRYPOINT ["soko-entrypoint"]
CMD ["php-fpm"]
