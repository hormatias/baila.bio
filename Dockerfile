FROM node:14

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de la aplicación
COPY . .

# Instalar dependencias y construir
RUN npm install
RUN npm run build

# Exponer el puerto
EXPOSE 3001

# Establecer variables de entorno
ENV PORT=3001
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["npm", "start"]