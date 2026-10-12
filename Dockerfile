# ----- Builder Stage -----
FROM node:24 AS builder

WORKDIR /app

COPY package*.json .

RUN npm ci

copy . .

RUN npm run build

# ----- Production Stage ------
FROM node:24-alpine

WORKDIR /app

RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

RUN apk add --no-cache curl

COPY package*.json .

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

COPY ./migrations ./migrations

RUN chown appuser:appgroup -R /app 

USER appuser

CMD ["node", "dist/server.js"]