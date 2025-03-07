# Use Node.js LTS version
FROM node:20-alpine AS builder

# Install dependencies needed for node-gyp and other build tools
RUN apk add --no-cache python3 make g++ git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps flag and increased network timeout
RUN npm install --legacy-peer-deps --network-timeout 100000

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3002

# Expose the port
EXPOSE 3002

# Start the application
CMD ["node", "server.js"] 