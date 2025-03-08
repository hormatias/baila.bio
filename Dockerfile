FROM node:18-alpine AS base

# Instalar dependencias necesarias para construir
FROM base AS deps
WORKDIR /app

# Instalar dependencias del sistema necesarias para compilación
RUN apk add --no-cache libc6-compat python3 make g++ git

# Copiar archivos de configuración de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias con mayor límite de memoria
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm ci --only=production --legacy-peer-deps

# Configuración de construcción
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Construir la aplicación
RUN npm run build

# Configuración de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3001

# Crear usuario no root para producción
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Crear directorio de datos con permisos correctos (como root)
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app

# Definir volumen
VOLUME ["/app/data"]

# Cambiar al usuario no root
USER nextjs

# Exponer el puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "server.js"]