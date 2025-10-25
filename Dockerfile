# -----------------------------------------------------------
# Build Stage - Creates the Next.js product build
# -----------------------------------------------------------
FROM node:22-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy dependency configuration files (package.json and lock file)
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy all Next.js project source code
COPY . .

# Compile the Next.js application
# This command will create the .next/ directory and static files, as well as server-side code.
# The 'build' script in your package.json runs 'next build'.
RUN npm run build

# -----------------------------------------------------------
# Production Stage - Creates a lightweight image to run the Next.js application
# -----------------------------------------------------------
FROM node:22-alpine AS runner

# Set the working directory inside the container
WORKDIR /app

# Next.js requires these directories to run in production.
# Copy only the package.json and lock file needed for runtime (only production deps).
COPY package.json package-lock.json ./

# Install only production dependencies (do not install dev dependencies)
RUN npm install --omit=dev

# Copy the .next/ directory from the 'builder' stage.
# This is where the optimized Next.js code is located.
COPY --from=builder /app/.next ./.next

# Copy the public/ directory containing static assets (e.g., images, favicon).
COPY --from=builder /app/public ./public

# Set the PORT environment variable that Next.js will listen on
ENV PORT 3000

# Expose the port your Next.js application will listen on
EXPOSE 3000

# Command to run your Next.js application when the container starts
# 'npm start' will start the Next.js application in production mode.
CMD ["npm", "start"]