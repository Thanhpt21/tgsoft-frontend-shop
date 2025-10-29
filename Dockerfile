# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json và cài dependencies
COPY package*.json ./
RUN npm ci

# Cài Tailwind v3
RUN npm install -D tailwindcss@3.4.14 postcss@latest autoprefixer@latest

# Copy cấu hình
COPY tsconfig.json tailwind.config.js postcss.config.js next.config.js ./

# Copy source và public
COPY src ./src
COPY public ./public

# Build Next.js
RUN npm run build

# Stage 2: Run
FROM node:20-alpine AS runner
WORKDIR /app

# Tạo user không phải root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy build từ stage builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set quyền cho user nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

# Runtime ENV sẽ được docker-compose.yml quản lý
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
