.PHONY: setup up down build logs

setup:
	cp .env.example .env

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f
