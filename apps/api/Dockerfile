# ============================================================
# FinWallet API — Dockerfile (Multi-stage Production Build)
# Section 7: DevOps
# ============================================================

# ── Stage 1: Dependencies ──────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Cài pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace files
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

RUN pnpm install --filter api --frozen-lockfile --prod

# ── Stage 2: Builder ──────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

RUN pnpm install --filter api --frozen-lockfile

COPY apps/api ./apps/api

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# TypeScript build
RUN cd apps/api && npx nest build

# ── Stage 3: Runner (Production) ──────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Tạo non-root user để bảo mật
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy artifacts từ builder
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./

# Chạy với non-root user
USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/v1/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

CMD ["node", "dist/main"]
