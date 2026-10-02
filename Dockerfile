# Build Stage
FROM node:24 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production Stage
FROM node:24-alpine

WORKDIR /app

RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN chown appuser:appgroup -R /app

USER appuser

EXPOSE 8000

ENTRYPOINT [ "node" ]

CMD [ "dist/server.js" ]