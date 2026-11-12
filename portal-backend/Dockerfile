# Multi-stage Dockerfile for JDP Team Portal & Inbound Mail Relay
FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Production Runner
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV SMTP_PORT=25

# Create persistent data directory
RUN mkdir -p /app/data /app/data/dkim

COPY --from=builder /app /app

# Port 3000 for Web Portal (proxied by Caddy)
# Port 25 for Inbound SMTP Relay (exposed to Internet for MX)
EXPOSE 3000 25

CMD ["node", "src/server.js"]
