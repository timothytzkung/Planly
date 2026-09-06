# Build context is ./backend (see docker-compose.yml), because the npm
# dependencies live in backend/package.json while the app code is in backend/server.
FROM node:24-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# App source
COPY server ./server

WORKDIR /app/server

EXPOSE 5050

CMD ["node", "server.js"]
