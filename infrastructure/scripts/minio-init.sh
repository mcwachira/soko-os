#!/bin/sh
set -e
mc alias set local http://minio:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"
mc mb --ignore-existing "local/${AWS_BUCKET:-soko-storage}"
mc anonymous set download "local/${AWS_BUCKET:-soko-storage}" || true
echo "MinIO bucket ready: ${AWS_BUCKET:-soko-storage}"
