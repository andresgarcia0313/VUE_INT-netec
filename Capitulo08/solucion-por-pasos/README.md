# Capítulo 8 - Monorepo, Docker y pipeline, código por paso

<!-- lang: es-CO -->

Una carpeta por paso de la [Práctica 8.4](https://andresgarcia0313.github.io/VUE_INT-netec/Capitulo08/). Desde el paso 1, cada una es el monorepo completo con el código acumulado hasta ese paso, comentado para quien ve pnpm workspaces, Docker y GitHub Actions por primera vez, con su `README.md` y su `captura.png`. El último paso es igual en código a `ejercicio-resuelto/`.

| Paso | Carpeta | Qué se ve |
|---|---|---|
| Preparación | [`paso-00-preparacion/`](paso-00-preparacion/) | `9.15.4`, sección `Server` de Docker y `Logged in to github.com` (sin código) |
| 1. Monorepo y paquetes | [`paso-01-monorepo-y-paquetes/`](paso-01-monorepo-y-paquetes/) | `Scope: all 3 workspace projects` y `Tests  2 passed (2)` |
| 2. App web | [`paso-02-app-web/`](paso-02-app-web/) | `✓ built in` y el catálogo con etiquetas de colores |
| 3. Observabilidad | [`paso-03-observabilidad/`](paso-03-observabilidad/) | Eventos de navegación y error con `version: "desarrollo"` |
| 4. Docker y Nginx | [`paso-04-docker-nginx/`](paso-04-docker-nginx/) | `healthy`, `/health` y `/catalogo` en 200; `version: "1.0.0"` en Chrome |
| 5. Pipeline | [`paso-05-pipeline-github-actions/`](paso-05-pipeline-github-actions/) | Flujos validados con `actionlint` y pasos de CI en verde en local (sin `push`) |
| Opcional. Rollback | [`paso-06-rollback-opcional/`](paso-06-rollback-opcional/) | `org.opencontainers.image.version:1.0.0` tras volver a la 1.0.0 |

Para ejecutar cualquier paso desde el 1: entra a su carpeta, `pnpm install` y la orden de su `README.md` (`pnpm test`, `pnpm build`, `pnpm dev` o las de Docker). pnpm se instala una vez con `npm install -g pnpm@9.15.4`.

## Control de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0 | 2026-10-27 | Andrés Eduardo García Márquez | Carpetas por paso (0 a 5 y el opcional) con código comentado, README y captura validada; Docker validado con build, `healthy` y `curl`; el `push` a GitHub no se ejecuta; equivalencia del último paso con `ejercicio-resuelto/` comprobada |
