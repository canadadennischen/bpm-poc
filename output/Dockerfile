# ── Build Stage ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY src/package*.json ./
RUN npm install --omit=dev

# ── Runtime Stage ─────────────────────────────────────────
FROM node:20-alpine

# 安裝 tzdata 以支援時區設定
RUN apk add --no-cache tzdata

ENV TZ=Asia/Taipei
ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY src/ .

EXPOSE 3000

CMD ["node", "server.js"]
