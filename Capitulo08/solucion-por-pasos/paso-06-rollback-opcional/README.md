# Capítulo 8 - Paso opcional. Rollback por etiqueta

<!-- {% raw %} -->

<!-- lang: es-CO -->

Monorepo con el código acumulado hasta este paso de la Práctica 8.4 (Catálogo Pro con pnpm workspaces, Docker y GitHub Actions). Los comentarios del código explican cada concepto.

## Qué cambió

Ningún archivo cambia: es el mismo código del paso 5, igual a `ejercicio-resuelto/` más comentarios. Este paso solo ejecuta órdenes de Docker.

## Concepto

Rollback es volver a la versión anterior pidiendo su imagen por la etiqueta, sin recompilar. Una imagen inmutable por versión permite promover y devolver la misma pieza que ya se probó. La etiqueta `org.opencontainers.image.version` dice qué versión corre.

## Cómo ejecutar

```bash
docker build --build-arg APP_VERSION=1.1.0 -t catalogo-platform:1.1.0 .
docker rm -f catalogo-platform
docker run -d --name catalogo-platform -p 8088:80 catalogo-platform:1.1.0
docker rm -f catalogo-platform
docker run -d --name catalogo-platform -p 8088:80 catalogo-platform:1.0.0
docker inspect --format "{{.Config.Labels}}" catalogo-platform
```

Limpieza: `docker rm -f catalogo-platform` y `docker rmi catalogo-platform:1.0.0 catalogo-platform:1.1.0`.

## Qué debes ver

Según la guía: entre las etiquetas, `org.opencontainers.image.version:1.0.0`. El segundo `docker build` tardó casi lo mismo que el primero (cambia el `ENV` y se repiten `COPY` e `install`); el rollback fue inmediato.

## Captura

![El build de 1.1.0 repite `COPY . .` e `install` (`#10 DONE 26.4s`) y solo reutiliza la imagen base y lo que va antes del `ENV`; el rollback arranca la 1.0.0 en segundos y `docker inspect` muestra `org.opencontainers.image.version:1.0.0`.](captura.png)

*El build de 1.1.0 repite `COPY . .` e `install` (`#10 DONE 26.4s`) y solo reutiliza la imagen base y lo que va antes del `ENV`; el rollback arranca la 1.0.0 en segundos y `docker inspect` muestra `org.opencontainers.image.version:1.0.0`.*

<!-- {% endraw %} -->
