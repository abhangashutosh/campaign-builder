.PHONY: help dev dev-infra test test-infra test-down migrate migrate-test seed clean logs-api logs-web type-check lint

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev-infra: ## Start infrastructure services (postgres, redis, adminer, redis-commander)
	docker compose -f infra/docker-compose.yml up -d

dev: dev-infra ## Start all services including api and web
	docker compose -f infra/docker-compose.yml --profile dev up -d

test-infra: ## Start test infrastructure
	docker compose -f infra/docker-compose.test.yml up -d

test-down: ## Stop and remove test infrastructure
	docker compose -f infra/docker-compose.test.yml down --volumes

migrate: ## Run migrations against dev database
	pnpm --filter @campaign/api migration:run

migrate-test: ## Run migrations against test database
	cross-env DATABASE_URL=postgresql://postgres:postgres@localhost:5433/campaign_test pnpm --filter @campaign/api migration:run

test: test-infra migrate-test ## Run all tests
	pnpm --filter @campaign/api test
	pnpm --filter @campaign/web test
	$(MAKE) test-down

type-check: ## Run TypeScript type checking
	pnpm --filter '*' exec tsc --noEmit

lint: ## Run linter across all packages
	pnpm --filter '*' lint

clean: ## Stop all docker services and clean volumes
	docker compose -f infra/docker-compose.yml down --volumes
	docker compose -f infra/docker-compose.test.yml down --volumes

logs-api: ## Tail API service logs
	docker compose -f infra/docker-compose.yml --profile dev logs -f api

logs-web: ## Tail web service logs
	docker compose -f infra/docker-compose.yml --profile dev logs -f web

seed: ## Seed development database
	pnpm --filter @campaign/api ts-node src/database/seeds/seed.ts
