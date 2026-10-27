# Capítulo 8 - Paso 4. Imagen Docker con Nginx, salud y versión

<!-- {% raw %} -->

<!-- lang: es-CO -->

Monorepo con el código acumulado hasta este paso de la Práctica 8.4 (Catálogo Pro con pnpm workspaces, Docker y GitHub Actions). Los comentarios del código explican cada concepto.

## Qué cambió

Nuevos en la raíz: `nginx.conf`, `.dockerignore` y `Dockerfile`.

## Concepto

El `Dockerfile` tiene dos etapas: la primera compila con Node.js (`pnpm install --frozen-lockfile` instala justo lo del bloqueo) y la segunda lleva solo Nginx y lo compilado. `--build-arg APP_VERSION` llega a Vite como `VITE_APP_VERSION`. En Nginx, `/health` responde `ok` para el `HEALTHCHECK` y `try_files` entrega `index.html` en rutas como `/catalogo`, que resuelve Vue Router.

## Cómo ejecutar

```bash
docker build --build-arg APP_VERSION=1.0.0 -t catalogo-platform:1.0.0 .
docker run -d --name catalogo-platform -p 8088:80 catalogo-platform:1.0.0
docker inspect --format "{{.State.Health.Status}}" catalogo-platform
curl -i http://127.0.0.1:8088/health       # en PowerShell: curl.exe
curl -I http://127.0.0.1:8088/catalogo
```

## Qué debes ver

Según la guía: `healthy`, `HTTP/1.1 200 OK` con `ok` en `/health` y `200 OK` en `/catalogo` gracias a `try_files`. En Chrome, `http://127.0.0.1:8088/catalogo` muestra en la consola `version: "1.0.0"`.

## Captura

![Final del `docker build` (etapas `build` y `stage-1`, `✓ built`), el contenedor arrancado, `healthy`, `/health` con `HTTP/1.1 200 OK` y `ok`, y `/catalogo` con `HTTP/1.1 200 OK`. Validado con Docker remoto (contexto `dell`): los `curl` se hicieron en ese equipo y se muestran con `-s` para ocultar la barra de progreso.](captura.png)

*Final del `docker build` (etapas `build` y `stage-1`, `✓ built`), el contenedor arrancado, `healthy`, `/health` con `HTTP/1.1 200 OK` y `ok`, y `/catalogo` con `HTTP/1.1 200 OK`. Validado con Docker remoto (contexto `dell`): los `curl` se hicieron en ese equipo y se muestran con `-s` para ocultar la barra de progreso.*

![`http://127.0.0.1:8088/catalogo` servido por el contenedor (por un túnel SSH al equipo de Docker): el catálogo con sus etiquetas y el evento de navegación con `version: "1.0.0"`.](captura-navegador.png)

*`http://127.0.0.1:8088/catalogo` servido por el contenedor (por un túnel SSH al equipo de Docker): el catálogo con sus etiquetas y el evento de navegación con `version: "1.0.0"`.*

<!-- {% endraw %} -->
