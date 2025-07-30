# Etapa 1: Build de la aplicación Angular
FROM node:18-slim AS build

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Instalar Angular CLI globalmente
RUN npm install -g @angular/cli@latest

# Configurar npm para mejor rendimiento
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fund false
RUN npm config set audit false

# Copiar package.json y package-lock.json primero
COPY package*.json ./

# Instalar TODAS las dependencias (necesarias para el build)
RUN npm ci --legacy-peer-deps

# Copiar el resto del código fuente
COPY . .

# Build de la aplicación para producción
RUN npm run build

# ... (previous lines in Dockerfile)

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine

# Eliminar configuración default de nginx
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf

# ... (previous lines in Dockerfile)

# Copiar los archivos buildeados desde la etapa anterior
COPY --from=build /app/dist/front/ /usr/share/nginx/html/

# Rename the index file if it's named differently (e.g., if it's index.csr.html)
RUN mv /usr/share/nginx/html/browser/index.csr.html /usr/share/nginx/html/browser/index.html

# Ensure correct permissions for Nginx user (as discussed previously)
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

# Copiar TU configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# ... (rest of Dockerfile)

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]