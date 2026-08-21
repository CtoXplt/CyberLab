# Multi-stage Dockerfile for Cyber Security Lab (CTF)

# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: PHP + SQLite/MySQL Server
FROM php:8.2-cli-alpine

# Install SQLite and required extensions
RUN apk add --no-cache sqlite sqlite-libs bash && \
    docker-php-ext-install pdo pdo_mysql pdo_sqlite

WORKDIR /var/www/html

# Copy backend
COPY backend/ ./backend/
COPY backdoor_file_shell/ ./backdoor_file_shell/

# Copy built frontend into public directory
COPY --from=frontend-builder /app/frontend/dist/ ./frontend/dist/

# Create uploads and rate limits directory with permissions
RUN mkdir -p backend/public/uploads backend/storage/rate_limits && \
    chmod -R 777 backend/public/uploads backend/storage/

# Initialize metadata for challenge cards
RUN php backend/scripts/inject_metadata.php

EXPOSE 10000

# Start PHP built-in server on port 10000 (Render.com default port)
CMD ["php", "-S", "0.0.0.0:10000", "-t", "frontend/dist", "backend/router.php"]
