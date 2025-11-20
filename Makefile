.PHONY: help build up down logs restart clean test shell health

# Default target
help:
	@echo "Kalkulator Pajak Pro - Docker Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make build      - Build Docker image"
	@echo "  make up         - Start containers in background"
	@echo "  make down       - Stop and remove containers"
	@echo "  make logs       - View container logs"
	@echo "  make restart    - Restart containers"
	@echo "  make clean      - Remove containers, images, and volumes"
	@echo "  make test       - Test Docker image"
	@echo "  make shell      - Open shell in running container"
	@echo "  make health     - Check container health"
	@echo "  make dev        - Run development server (non-Docker)"
	@echo ""

# Build Docker image
build:
	@echo "Building Docker image..."
	docker-compose build

# Start containers
up:
	@echo "Starting containers..."
	docker-compose up -d
	@echo "Application running at http://localhost:8080"

# Stop containers
down:
	@echo "Stopping containers..."
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Restart containers
restart:
	@echo "Restarting containers..."
	docker-compose restart

# Clean up everything
clean:
	@echo "Cleaning up Docker resources..."
	docker-compose down -v
	docker system prune -f

# Test Docker image
test:
	@echo "Testing Docker image..."
	@docker run -d --name test-app -p 8081:80 kalkulator-pajak-pro:latest || true
	@sleep 3
	@curl -f http://localhost:8081/health && echo "\nHealth check passed" || echo "\n Health check failed"
	@curl -f http://localhost:8081/ > /dev/null && echo "Main page accessible" || echo " Main page failed"
	@docker stop test-app && docker rm test-app

# Open shell in container
shell:
	docker exec -it kalkulator-pajak-pro sh

# Check health
health:
	@echo "Checking container health..."
	@docker inspect --format='{{.State.Health.Status}}' kalkulator-pajak-pro 2>/dev/null || echo "Container not running"
	@curl -s http://localhost:8080/health || echo "Health endpoint not accessible"

# Development mode (non-Docker)
dev:
	@echo "Starting development server..."
	pnpm dev

# Install dependencies
install:
	@echo "Installing dependencies..."
	pnpm install

# Build for production (non-Docker)
build-prod:
	@echo "Building for production..."
	pnpm build

# Preview production build
preview:
	@echo "Previewing production build..."
	pnpm preview
