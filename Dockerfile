# Dockerfile

# -----------------
# Build stage
# -----------------
FROM node:20.19 AS build
WORKDIR /app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --verbose

# Copy source code
COPY . .

# Copy env.prod thành .env để Next.js sử dụng
COPY .env.prod .env

# Build Next.js app
RUN npm run build

# -----------------
# Runtime stage
# -----------------
FROM node:20.19-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone build output
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
