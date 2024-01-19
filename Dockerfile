FROM node:21-alpine

RUN apk add nginx
COPY server/nginx.conf /etc/nginx/http.d/default.conf
WORKDIR /opt
COPY . .
CMD  ["sh", "-c", "nginx && exec node /opt/server/server.js"]