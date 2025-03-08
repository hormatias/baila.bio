FROM node:18-alpine AS base

# Instalar dependencias necesarias para construir
FROM base AS deps
WORKDIR /app

# Instalar dependencias del sistema necesarias para compilación
RUN apk add --no-cache libc6-compat python3 make g++ git

# Instalar yarn globalmente
RUN npm install -g yarn

# Copiar archivos de configuración de dependencias
COPY package.json package-lock.json* ./

# Instalar todas las dependencias con yarn
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN yarn install --frozen-lockfile --network-timeout 600000

# Configuración de construcción
FROM base AS builder
WORKDIR /app

# Instalar yarn globalmente en esta etapa también
RUN npm install -g yarn

# Copiar dependencias y archivos del proyecto
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Eliminar configuraciones duplicadas que pueden causar conflictos
RUN if [ -f next.config.js ] && [ -f next.config.mjs ]; then rm next.config.js; fi

# Construir la aplicación con mayor límite de memoria
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV NEXT_TELEMETRY_DISABLED=1

# Ejecutar build con yarn
RUN yarn build

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