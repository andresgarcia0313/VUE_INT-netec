# Capítulo 4 - Paso 5. Auditoría en desarrollo

<!-- lang: es-CO -->

Proyecto Vite completo con el código acumulado hasta este paso de la Práctica 4.4 (ProjectHub con Pinia). Los comentarios del código explican cada concepto.

## Qué cambió

Nuevo: `src/plugins/audit.js`. Cambiado: `src/main.js` (import de `auditPlugin` y `if (import.meta.env.DEV) pinia.use(auditPlugin)`).

## Concepto

`$onAction` avisa antes de cada action y da dos ganchos: `after` (terminó bien) y `onError` (falló). Así se mide sin tocar ninguna tienda. `import.meta.env.DEV` vale `true` con el servidor de desarrollo y `false` en `npm run build`, por eso la auditoría no llega a producción (comprobado: el build no contiene el plugin).

## Cómo ejecutar

```bash
npm install              # instala las dependencias (una vez por carpeta)
npx vite --port 5174     # como en la guía; también sirve npm run dev (puerto 5173)
```

Abre `http://localhost:5174/proyectos` en Chrome.

## Qué debes ver

Según la guía: cuatro líneas: `apiStatus.track 305.7 ms` y `tasks.loadAll 311.8 ms` (las tareas), y `apiStatus.track 414.3 ms` y `projects.loadAll 419.2 ms` (los proyectos). [...] Pulsa **Simular error** y salen tres más: `ui.notify 0.3 ms`, en rojo `apiStatus.track el servidor respondió 500` [...] y `projects.loadAll 411.9 ms` como mensaje normal.

![Tras **Simular error**, el panel de consola muestra `ui.notify 0.3 ms`, `[console.error] apiStatus.track el servidor respondió 500` y `projects.loadAll 404.7 ms`.](captura.png)

*Tras **Simular error**, el panel de consola muestra `ui.notify 0.3 ms`, `[console.error] apiStatus.track el servidor respondió 500` y `projects.loadAll 404.7 ms`.*

![Tras `F5` en `/proyectos`: `apiStatus.track 300.3 ms`, `tasks.loadAll 301.1 ms`, `apiStatus.track 432.8 ms`, `projects.loadAll 436.7 ms`](captura-carga.png)

*Tras `F5` en `/proyectos`: `apiStatus.track 300.3 ms`, `tasks.loadAll 301.1 ms`, `apiStatus.track 432.8 ms`, `projects.loadAll 436.7 ms`.*
