.PHONY: up down migrate logs ps restart reset shell-backend shell-web seed fresh-test clean help

COMPOSE := docker compose
COMPOSE_FILES := -f docker-compose.yml -f docker-compose.dev.yml

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start the full stack (frontend + backend + all services)
	$(COMPOSE) $(COMPOSE_FILES) up -d --build

down: ## Stop the stack
	$(COMPOSE) $(COMPOSE_FILES) down

restart: ## Restart all services
	$(COMPOSE) $(COMPOSE_FILES) restart

logs: ## Tail logs from all services
	$(COMPOSE) $(COMPOSE_FILES) logs -f

ps: ## Show running containers
	$(COMPOSE) $(COMPOSE_FILES) ps

migrate: ## Run database migrations
	$(COMPOSE) $(COMPOSE_FILES) exec -T backend php artisan migrate --force

seed: ## Seed the database
	$(COMPOSE) $(COMPOSE_FILES) exec -T backend php artisan db:seed --force

fresh: ## Drop all tables and re-migrate + seed (destructive)
	$(COMPOSE) $(COMPOSE_FILES) exec -T backend php artisan migrate:fresh --seed --force

reset: ## Stop stack, remove containers and volumes (destructive)
	@echo "DESTRUCTIVE: removing containers and volumes"
	$(COMPOSE) $(COMPOSE_FILES) down -v

shell-backend: ## Open a bash shell in the backend container
	$(COMPOSE) $(COMPOSE_FILES) exec backend bash

shell-web: ## Open a bash shell in the web container
	$(COMPOSE) $(COMPOSE_FILES) exec web sh

test-backend: ## Run backend tests
	$(COMPOSE) $(COMPOSE_FILES) exec -T backend php artisan test

health: ## Check API health
	@curl -s http://localhost:8080/api/v1/health || echo "API not ready yet"

start: up migrate ## Start stack and run migrations
