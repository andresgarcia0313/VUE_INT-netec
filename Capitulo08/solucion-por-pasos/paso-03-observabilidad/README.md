# Capítulo 8 - Paso 3. Observabilidad y versión en el navegador

<!-- lang: es-CO -->

Monorepo con el código acumulado hasta este paso de la Práctica 8.4 (Catálogo Pro con pnpm workspaces, Docker y GitHub Actions). Los comentarios del código explican cada concepto.

## Qué cambió

Nuevo: `apps/web/src/observabilidad.js`. Cambiado: `apps/web/src/main.js` (dos líneas: el `import` y `instalarObservabilidad(app, router)` antes de `app.use(router)`).

## Concepto

Observabilidad es dejar rastro de lo que pasa en el navegador del usuario. `router.beforeEach` arranca un cronómetro y `router.afterEach` reporta cada navegación con su duración; `app.config.errorHandler` recibe todo error que Vue atrapa. Cada evento lleva la versión (`VITE_APP_VERSION`, o `desarrollo` si nadie la fijó) y se guarda en `localStorage`.

## Cómo ejecutar

```bash
npm install -g pnpm@9.15.4   # pnpm en la versión del curso (una sola vez por equipo)
pnpm install
pnpm dev                  # abre http://127.0.0.1:5178 con la consola abierta (F12)
```

Pulsa **Catálogo**, luego **Inicio** y luego **Simular error**. En la consola escribe `JSON.parse(localStorage.getItem('catalogo-platform:observability'))`.

## Qué debes ver

Según la guía: eventos `[catalogo-observability]` con `type: "navigation"`, `from`, `to`, `durationMs` y `version: "desarrollo"`, un evento `type: "error"` con el mensaje de prueba y, en Catálogo, las etiquetas de colores.

## Captura

![Tras pulsar Catálogo, Inicio y Simular error: la franja oscura reproduce lo que devuelve la consola, cuatro eventos con `version: "desarrollo"` (navegaciones `/`, `/` a `/catalogo`, `/catalogo` a `/`) y el `error` con `"Error de prueba desde Inicio"`. La consola registró además cuatro `[catalogo-observability]`.](captura.png)

*Tras pulsar Catálogo, Inicio y Simular error: la franja oscura reproduce lo que devuelve la consola, cuatro eventos con `version: "desarrollo"` (navegaciones `/`, `/` a `/catalogo`, `/catalogo` a `/`) y el `error` con `"Error de prueba desde Inicio"`. La consola registró además cuatro `[catalogo-observability]`.*
