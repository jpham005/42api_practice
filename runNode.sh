docker run -it --rm --name noder -d --env-file ./.env -v${PWD}/js:/tmp node:19.2.0-alpine3.16
docker exec -it noder sh #; docker stop noder
