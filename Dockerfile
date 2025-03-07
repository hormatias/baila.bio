# Use Node.js LTS version
FROM node:20-alpine AS builder

# Install dependencies needed for node-gyp and other build tools
RUN apk add --no-cache python3 make g++ git curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean npm install
RUN npm install --production --force

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
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3002
ENV HOST=0.0.0.0

# Expose the port
EXPOSE 3002

# Start the application
CMD ["node", "server.js"] 