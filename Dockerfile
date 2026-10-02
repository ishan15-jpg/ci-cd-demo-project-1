# --------- Build Stage ----------
FROM node:24 AS builder

WORKDIR /app

COPY ./package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ------- Production Stage -------
FROM node:24-alpine

WORKDIR /app

RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

COPY ./package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN chown -R appuser:appgroup /app

USER appuser

ENTRYPOINT [ "node" ]

EXPOSE 8000

CMD [ "dist/server.js" ]