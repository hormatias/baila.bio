FROM node:18-alpine AS base

# Instalar dependencias necesarias para construir
FROM base AS deps
WORKDIR /app

# Instalar dependencias del sistema necesarias para compilación
RUN apk add --no-cache libc6-compat python3 make g++ git

# Copiar archivos de configuración de dependencias
COPY package.json package-lock.json* ./

# Instalar todas las dependencias con estrategias para evitar fallos
ENV NODE_OPTIONS="--max-old-space-size=8192"
# Limpiar caché de npm y usar estrategias para evitar fallos de red
RUN npm cache clean --force && \
    npm config set network-timeout 300000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --no-fund --no-audit

# Configuración de construcción
FROM base AS builder
WORKDIR /app

# Copiar dependencias y archivos del proyecto
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Eliminar configuraciones duplicadas que pueden causar conflictos
RUN if [ -f next.config.js ] && [ -f next.config.mjs ]; then rm next.config.js; fi

# Construir la aplicación con mayor límite de memoria
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV NEXT_TELEMETRY_DISABLED=1

# Ejecutar build con más verbosidad para ver el error
RUN npm run build

# Configuración de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3001
ENV NEXT_TELEMETRY_DISABLED=1

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