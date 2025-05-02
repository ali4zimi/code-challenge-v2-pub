# 1. Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# 2. Runtime Stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.output ./.output
EXPOSE 8000
ENV PORT=8000
CMD ["node", ".output/server/index.mjs"]