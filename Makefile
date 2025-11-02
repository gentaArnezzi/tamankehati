# Taman Kehati - Docker Makefile
# Provides convenient commands for Docker operations

.PHONY: help build up down logs restart clean migrate test

# Default target
.DEFAULT_GOAL := help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Taman Kehati - Docker Commands$(NC)"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Build Docker images
	docker-compose build

build-prod: ## Build production Docker images
	docker-compose -f docker-compose.prod.yml build

up: ## Start development environment
	docker-compose up -d
	@echo "$(GREEN)✅ Services started!$(NC)"
	@echo "$(BLUE)Frontend:$(NC) http://localhost:3000"
	@echo "$(BLUE)Backend:$(NC) http://localhost:8000"
	@echo "$(BLUE)API Docs:$(NC) http://localhost:8000/docs"

up-prod: ## Start production environment
	docker-compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✅ Production services started!$(NC)"

down: ## Stop all services
	docker-compose down

down-prod: ## Stop production services
	docker-compose -f docker-compose.prod.yml down

logs: ## View logs (use LOGS_SERVICE=backend or LOGS_SERVICE=frontend)
	docker-compose logs -f $(LOGS_SERVICE)

logs-prod: ## View production logs
	docker-compose -f docker-compose.prod.yml logs -f

restart: ## Restart all services
	docker-compose restart

restart-prod: ## Restart production services
	docker-compose -f docker-compose.prod.yml restart

migrate: ## Run database migrations
	docker-compose --profile tools run --rm migrate

migrate-prod: ## Run database migrations in production
	docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

shell-backend: ## Open shell in backend container
	docker-compose exec backend bash

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend sh

shell-db: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U kehati_user -d kehati_db

status: ## Show service status
	docker-compose ps

status-prod: ## Show production service status
	docker-compose -f docker-compose.prod.yml ps

clean: ## Clean up Docker resources (removes containers, volumes)
	@echo "$(YELLOW)⚠️  This will remove all containers and volumes!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		docker system prune -f; \
		echo "$(GREEN)✅ Cleanup completed!$(NC)"; \
	fi

clean-all: ## Clean everything including images
	@echo "$(YELLOW)⚠️  This will remove all containers, volumes, and images!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v --rmi all; \
		docker system prune -af; \
		echo "$(GREEN)✅ Complete cleanup finished!$(NC)"; \
	fi

test: ## Run tests (backend)
	docker-compose exec backend pytest

init-admin: ## Initialize admin user
	docker-compose exec backend python init_admin.py

init-admin-prod: ## Initialize admin user in production
	docker-compose -f docker-compose.prod.yml exec backend python init_admin.py

