# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy env
COPY .env.prod ./.env.production

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (package-lock.json đã được fix local rồi)
RUN npm ci --legacy-peer-deps

# Copy config files
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY next.config.js ./

# Copy source code
COPY src ./src
COPY public ./public

# Build Next.js app
RUN npm run build

# Stage 2: Run
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]