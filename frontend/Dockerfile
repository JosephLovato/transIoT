# build from source code in temporay node container
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# transfer build to nginx container for serving
FROM nginx:latest
COPY --from=build /usr/local/app/dist/trans-io-t /usr/share/nginx/html
EXPOSE 80


