.PHONY: all
all: build
	make run

build:
	docker build -tconcept . && touch build

run:
	docker run --rm -v$(shell pwd):/usr/share/nginx/html/ -p80:80 --name concept nginx

.PHONY: down
down:
	docker stop concept

.PHONY:	clean
clean:
	docker system prune -a
	rm build
