FROM node:16 AS builder

WORKDIR /app

# Copiar todo el código fuente
COPY . .

# Instalar dependencias y construir
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm install
RUN npm run build

# Etapa de producción
FROM node:16-slim

WORKDIR /app
ENV NODE_ENV production
ENV PORT 3001

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Crear directorio de datos
RUN mkdir -p /app/data

# Exponer el puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["npm", "start"]