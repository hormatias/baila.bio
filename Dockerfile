FROM node:16 AS builder

WORKDIR /app

# Configurar npm para ser más tolerante a errores
RUN npm config set fetch-retry-maxtimeout 60000 \
    && npm config set fetch-retry-mintimeout 15000 \
    && npm config set fetch-retries 5 \
    && npm config set loglevel verbose

# Copiar solo los archivos de configuración primero
COPY package.json ./
COPY package-lock.json* ./

# Instalar dependencias con --legacy-peer-deps para mayor compatibilidad
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm install --legacy-peer-deps --no-optional

# Ahora copiar el resto del código
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción - usar imagen base más completa para mayor compatibilidad
FROM node:16

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