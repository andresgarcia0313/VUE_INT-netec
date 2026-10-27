# Capítulo 3 - Práctica 3.4: rutas protegidas y carga dinámica

<!-- lang: es-CO -->

Una carpeta por paso de la guía. Cada carpeta es un proyecto Vite completo con el código acumulado hasta ese paso y comentarios que explican el concepto de Vue usado. El paso 5 es igual en código al `ejercicio-resuelto/` del repositorio.

Para ejecutar cualquier paso: entra a la carpeta, `npm install` y `npm run dev`.

| Paso | Carpeta | Qué se ve |
|---|---|---|
| Paso 0 | [`paso-00-preparacion`](paso-00-preparacion/) | Título "You did it!" y, en el panel de consola, el aviso `No match found for location with path "/"`. |
| Paso 1 | [`paso-01-mapa-de-rutas-anidadas`](paso-01-mapa-de-rutas-anidadas/) | Después de pulsar **Tarea 202**: menú y "Tarea recibida desde la dirección: task-202". Comprobado también `/app/tasks/abc` (muestra `abc`) y `/no-existe` ("Página no encontrada"). |
| Paso 2 | [`paso-02-sesion-meta-y-guardia`](paso-02-sesion-meta-y-guardia/) | Tras abrir `/app/projects` sin sesión y entrar como user: "Úrsula (user)" en `/app/projects`, sin Administración. Comprobados también `/forbidden`, `/admin` como admin y el error de correo. |
| Paso 3 | [`paso-03-carga-perezosa-y-precarga`](paso-03-carga-perezosa-y-precarga/) | `/login` con el panel de red: `DashboardView.vue` ya descargado (precarga) y sin `ProjectsView.vue`. El build dio los 5 archivos `.js` de la guía; al pulsar Proyectos se descargó `ProjectsView.vue`. |
| Paso 4 | [`paso-04-errores-y-fragmento-perdido`](paso-04-errores-y-fragmento-perdido/) | `captura.png`: `/chunk-recovery?target=/admin` con el 404 de `AdminView-*.js` en el panel. `captura-navegacion-redundante.png`: el aviso `Avoided redundant navigation` al pulsar Proyectos dos veces. |
| Paso 5 | [`paso-05-comprobacion`](paso-05-comprobacion/) | Sesión de Ada (admin) en `/app/tasks/task-202`, con el enlace Administración visible. |

## Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-10-27 | Carpetas por paso con código comentado, README y captura validada |
