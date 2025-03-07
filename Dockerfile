# Use Node.js LTS version
FROM node:20-alpine AS builder

# Install dependencies needed for node-gyp and other build tools
RUN apk add --no-cache python3 make g++ git curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install dependencies
RUN npm cache clean --force && \
    npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retry-maxtimeout 600000 && \
    npm ci --prefer-offline --no-audit

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