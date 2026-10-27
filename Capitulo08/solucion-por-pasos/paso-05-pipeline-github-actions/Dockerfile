# Dockerfile de dos etapas: la primera compila con Node.js y la segunda solo sirve lo compilado con Nginx.
# La imagen final no lleva Node.js ni node_modules: es pequeña y se promueve igual entre ambientes.
# Etapa 1, build: Node.js instala y compila
FROM node:24.22.0-alpine AS build
# carpeta de trabajo dentro de la imagen
WORKDIR /app
# versión que llega con --build-arg; Vite la publica como VITE_APP_VERSION
ARG APP_VERSION=desarrollo
ENV VITE_APP_VERSION=$APP_VERSION
# copia el monorepo (.dockerignore excluye node_modules y dist)
COPY . .
# activa pnpm en la versión de packageManager e instala justo lo del bloqueo
RUN corepack enable && pnpm install --frozen-lockfile
# compila la app web: deja apps/web/dist
RUN pnpm --filter @catalogo/web build
# Etapa 2: solo Nginx y lo compilado
FROM nginx:1.27.3-alpine
# cada etapa empieza de cero, por eso el ARG se declara otra vez
ARG APP_VERSION=desarrollo
# etiqueta estándar para saber qué versión corre
LABEL org.opencontainers.image.version=$APP_VERSION
# configuración con /health y try_files
COPY nginx.conf /etc/nginx/conf.d/default.conf
# trae dist/ desde la etapa 1
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
# cada 10 s Docker pregunta por /health; tres fallos seguidos = unhealthy
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1
