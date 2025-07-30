# Etapa 1: Build de la aplicación Angular
FROM node:18-alpine AS build

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilación
RUN apk add --no-cache python3 make g++

# Copiar package.json y package-lock.json
COPY package*.json ./

# Limpiar cache de npm y reinstalar dependencias
RUN npm cache clean --force
RUN rm -rf node_modules package-lock.json
RUN npm install

# Copiar el código fuente
COPY . .

# Build de la aplicación para producción
RUN npm run build

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine

# Copiar los archivos buildeados desde la etapa anterior
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]