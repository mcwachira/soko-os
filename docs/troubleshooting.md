# Soko-OS Troubleshooting

For every issue: **Symptom → Likely cause → Diagnose → Fix → Prevention**.

---

## Docker won't start

**Symptom:** `pnpm dev:up` fails or containers exit.  
**Likely cause:** Port conflict, build failure, Docker daemon down.  
**Diagnose:**

```bash
docker info
docker compose ps -a
docker compose logs backend --tail=100
docker compose logs web --tail=100
```

**Fix:** Free ports 8080/3001/5437/6382/8026/9002/9003 or change them in `.env`. Rebuild: `docker compose build --no-cache backend`.  
**Prevention:** Document custom ports in `.env`; don't run duplicate stacks.

---

## Nginx error / API 502

**Symptom:** Frontend loads but `/api/v1/health` fails.  
**Likely cause:** PHP-FPM not healthy; FastCGI misconfig; vendor missing.  
**Diagnose:**

```bash
docker compose ps
docker compose logs nginx --tail=50
docker compose exec backend php artisan --version
curl -i http://localhost:8080/api/v1/health
```

**Fix:** Wait for `backend` healthy; `docker compose exec backend composer install`; restart nginx.  
**Prevention:** Healthchecks + `pnpm db:migrate` only after backend healthy.

---

## Next.js unavailable

**Symptom:** Nginx `/` returns 502.  
**Likely cause:** `web` still installing pnpm deps (first boot is slow).  
**Diagnose:** `docker compose logs web --tail=100`  
**Fix:** Wait for “Ready”; ensure `pnpm-lock.yaml` present; restart `web`.  
**Prevention:** Keep lockfile committed; use anonymous volumes for node_modules as in Compose.

---

## PostgreSQL unavailable

**Symptom:** Migrations fail; health database unhealthy.  
**Diagnose:** `docker compose exec postgres pg_isready -U soko -d soko_os`  
**Fix:** `docker compose up -d postgres` and wait healthy; check credentials.  
**Prevention:** Always `depends_on: condition: service_healthy`.

---

## Redis unavailable

**Symptom:** Queue/session errors; health redis unhealthy.  
**Diagnose:** `docker compose exec redis redis-cli ping`  
**Fix:** Restart redis; confirm `REDIS_HOST=redis` inside containers.  
**Prevention:** Don't point containers at `127.0.0.1` for Redis.

---

## Queue / scheduler failure

**Diagnose:** `docker compose logs queue scheduler --tail=100`  
**Fix:** Ensure migrations created `jobs` tables; Redis up; shared vendor volume populated.  
**Prevention:** Start queue after backend healthy (Compose already does).

---

## Mailpit failure

**Diagnose:** open http://localhost:8026  
**Fix:** Restart `mailpit`; use host port `1026` from host apps, `mailpit:1025` from containers.

---

## MinIO failure

**Diagnose:** http://localhost:9003 + `docker compose logs minio-init`  
**Fix:** Restart minio; re-run minio-init; check credentials.

---

## Migration failure

**Diagnose:** `docker compose exec backend php artisan migrate --force -v`  
**Fix:** Resolve users/UUID conflicts (base users migration is UUID); `migrate:fresh` only on disposable dev volumes (`pnpm db:reset` — destructive).

---

## CORS / auth issues

Not fully configured yet (auth Partially Implemented). Prefer same-origin via Nginx (`/api` on same host).

---

## Offline DB / sync stuck

Dexie DB name: `SokoOS_OfflineDB`. Clear site data in browser for a local reset. Server sync endpoints are scaffolds — verify with `curl` before blaming the client.

---

## Duplicate transaction

Ensure `idempotency_key` uniqueness on `sync_operations` and never generate a new key on retry.

---

## KRA failure

Expected without credentials: submissions stay `queued`. Do not treat local control codes as real KRA acceptance.
