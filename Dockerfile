FROM node:18 AS base

# Configuración de construcción
FROM base AS builder
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias con un enfoque simple
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Eliminar configuraciones duplicadas que pueden causar conflictos
RUN if [ -f next.config.js ] && [ -f next.config.mjs ]; then rm next.config.js; fi

# Construir la aplicación
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Configuración de producción
FROM node:18-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3001
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no root para producción
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Crear directorio de datos con permisos correctos
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app

# Definir volumen
VOLUME ["/app/data"]

# Cambiar al usuario no root
USER nextjs

# Exponer el puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "server.js"]