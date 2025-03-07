# Use Node.js LTS version
FROM node:18-alpine

# Install dependencies needed for build
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

EXPOSE 3002

CMD ["npm", "start"] 