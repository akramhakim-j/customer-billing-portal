# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN npm install -g pnpm

WORKDIR /app

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

# Copy compiled output only
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
