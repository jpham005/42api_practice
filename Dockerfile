FROM node:19.2.0-alpine3.16
RUN mkdir -p /app
COPY ./frontend_entry.sh /tmp/frontend_entry.sh
RUN chmod +x /tmp/frontend_entry.sh
WORKDIR /app

EXPOSE 3000
