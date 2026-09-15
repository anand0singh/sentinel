# ==============================================================================
# SENTINEL - Automation & Orchestration Makefile
# ==============================================================================

SHELL := /bin/bash
PYTHON := python
PIP := pip
DOCKER_COMPOSE := docker compose

.PHONY: help setup run stop restart logs test range-benchmark clean lint

help:
	@echo "SENTINEL Orchestration Commands:"
	@echo "  make setup            - Copy .env, build images, initialize ClickHouse & Kafka"
	@echo "  make run              - Start all Sentinel services in background"
	@echo "  make stop             - Stop all running services"
	@echo "  make restart          - Restart all services"
	@echo "  make logs             - Tail logs of core pipeline & API"
	@echo "  make test             - Run unit & integration test suite"
	@echo "  make range-benchmark  - Execute Red-vs-Blue cyber range evaluation"
	@echo "  make clean            - Remove test cache and teardown volumes"

setup:
	@test -f .env || cp .env.example .env
	@echo "[*] Setting up dependencies and building containers..."
	$(DOCKER_COMPOSE) build
	@echo "[+] Setup complete. Ready to run."

run:
	@echo "[*] Starting SENTINEL Cyber Defense Stack..."
	$(DOCKER_COMPOSE) up -d
	@echo "[+] Services started. API available at http://localhost:8000 (Docs: /docs)"
	@echo "[+] SOC Dashboard available at http://localhost:3000"

stop:
	@echo "[*] Stopping SENTINEL services..."
	$(DOCKER_COMPOSE) down

restart: stop run

logs:
	$(DOCKER_COMPOSE) logs -f sentinel-engine sentinel-api

test:
	@echo "[*] Executing test suite..."
	pytest tests/ -v --disable-warnings

range-benchmark:
	@echo "[*] Starting Cyber Range Red vs Blue Automated Evaluation..."
	$(PYTHON) cyber_range/benchmark.py

lint:
	flake8 engine agent api cyber_range tests --max-line-length=120 || true
	black --check engine agent api cyber_range tests || true

clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
