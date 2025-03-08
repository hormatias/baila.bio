FROM node:14-alpine

# Crear directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat

# Configurar npm para ser más tolerante a errores
RUN npm config set network-timeout 100000

# Copiar archivos de la aplicación
COPY . .

# Instalar dependencias y construir
RUN npm install
RUN npm run build

# Crear directorio de datos
RUN mkdir -p /app/data

# Exponer el puerto
EXPOSE 3001

# Establecer variables de entorno
ENV PORT 3001
ENV NODE_ENV production

# Comando para iniciar la aplicación
CMD ["npm", "start"]