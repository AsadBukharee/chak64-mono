FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci || npm install

# Copy source and build
COPY frontend/ .
RUN npm run build

# Serve with nginx
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a simple nginx config for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
