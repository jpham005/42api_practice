DOCKER_COMPOSE	:=	docker-compose

.PHONY: all
all:
	$(DOCKER_COMPOSE) up --build

.PHONY: down
down:
	$(DOCKER_COMPOSE) down

.PHONY: clean
clean: down
	docker system prune -a
