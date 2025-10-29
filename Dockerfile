# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Cài Tailwind v3
RUN npm install -D tailwindcss@3.4.14 postcss@latest autoprefixer@latest

# Copy config
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY next.config.js ./

# Copy source
COPY src ./src
COPY public ./public

RUN npm run build

# Stage 2: Run
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app
USER nextjs

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]