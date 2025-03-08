FROM node:14

# Crear directorio de trabajo
WORKDIR /app

# Copiar solo los archivos de configuración primero
COPY package.json package-lock.json* ./

# Instalar dependencias con flags para mayor compatibilidad
RUN npm install --legacy-peer-deps

# Copiar el resto de los archivos
COPY . .

# Configurar Next.js para ignorar errores de TypeScript y ESLint durante la construcción
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_LINT=false
ENV NEXT_IGNORE_TYPESCRIPT_ERRORS=true

# Construir con más información de depuración
RUN npm run build --verbose

# Exponer el puerto
EXPOSE 3001

# Establecer variables de entorno
ENV PORT=3001
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["npm", "start"]