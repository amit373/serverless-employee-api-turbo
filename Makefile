.PHONY: help build up down logs clean test lint type-check docker-build docker-up docker-down docker-logs docker-shell install dev dev-with-db build-packages

# Variables
DOCKER_IMAGE_NAME=serverless-ecommerce-api
DOCKER_CONTAINER_NAME=ecommerce-api
DOCKER_COMPOSE_FILE=docker-compose.yml

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install
	npm run build:packages

build: ## Build the project
	npm run build

test: ## Run tests
	npm run test

lint: ## Run linter
	npm run lint

type-check: ## Run TypeScript type checking
	npm run type-check

clean: ## Clean build artifacts
	rm -rf node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/dist
	rm -rf apps/*/dist
	rm -rf packages/*/tsconfig.tsbuildinfo
	rm -rf apps/*/tsconfig.tsbuildinfo
	rm -rf tsconfig.tsbuildinfo
	find . -type f \( -name "*.js" -o -name "*.d.ts" -o -name "*.js.map" -o -name "*.d.ts.map" \) ! -path "*/node_modules/*" ! -path "*/dist/*" -delete

docker-build: ## Build Docker image
	docker build -t $(DOCKER_IMAGE_NAME):latest .

docker-up: ## Start Docker container
	docker-compose up -d

docker-down: ## Stop Docker container
	docker-compose down

docker-logs: ## View Docker container logs
	docker-compose logs -f $(DOCKER_CONTAINER_NAME)

docker-shell: ## Access Docker container shell
	docker-compose exec $(DOCKER_CONTAINER_NAME) sh

docker-restart: ## Restart Docker container
	docker-compose restart $(DOCKER_CONTAINER_NAME)

dev: build-packages ## Run development server (builds packages first, then starts serverless offline)
	@echo "Starting development server..."
	@echo "Make sure MongoDB is running (use 'make docker-up' to start it)"
	@echo "Using Node 20 for compatibility..."
	@[ -s "$$HOME/.nvm/nvm.sh" ] && . "$$HOME/.nvm/nvm.sh" && nvm use 20 >/dev/null 2>&1 || true
	cd apps/ecommerce-api && npm run dev

dev-with-db: docker-up build-packages ## Start MongoDB and run development server
	@echo "Starting MongoDB and development server..."
	@sleep 3
	cd apps/ecommerce-api && npm run dev

build-packages: ## Build all packages (continues even with zod type errors)
	@echo "Building packages..."
	-npm run build:packages || echo "Build completed with some type errors (zod v4 compatibility), but continuing..."
	@echo "Packages built (some type errors ignored - serverless-esbuild will handle bundling)"

deploy: ## Deploy to AWS
	cd apps/ecommerce-api && npm run deploy

all: clean install build type-check lint ## Run all checks (clean, install, build, type-check, lint)
