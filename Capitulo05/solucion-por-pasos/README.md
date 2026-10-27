# Capítulo 5 - Clientes REST y GraphQL con caché y errores, código por paso

<!-- lang: es-CO -->

Una carpeta por paso de la [Práctica 5.4](https://andresgarcia0313.github.io/VUE_INT-netec/Capitulo05/). Cada una es un proyecto Vite completo y ejecutable con el código acumulado hasta ese paso, comentado para quien ve Vue, Axios, Apollo y MSW por primera vez, con su `README.md` y su `captura.png`. El paso 6 es igual en código a `ejercicio-resuelto/`.

Para ejecutar cualquier paso: entra a la carpeta, `npm install` y `npx vite --port 5175`.

| Paso | Carpeta | Qué se ve |
|---|---|---|
| Preparación | [`paso-00-preparacion/`](paso-00-preparacion/) | "You did it!" y la salida `Worker script successfully copied!` con `mockServiceWorker.js` en `public/`. |
| 1. Servidor simulado | [`paso-01-servidor-simulado/`](paso-01-servidor-simulado/) | "You did it!" y `[MSW] Mocking enabled.` en la consola. |
| 2. AppError y cliente REST | [`paso-02-apperror-y-cliente-rest/`](paso-02-apperror-y-cliente-rest/) | Consola: `{type: "authentication", status: 401, ...}` sin token y los 2 proyectos con token. |
| 3. GraphQL y caché | [`paso-03-graphql-y-cache/`](paso-03-graphql-y-cache/) | Dos llamadas, una sola petición `graphql`, y `["Task:t-1","Task:t-2","Project:p-100"]`. |
| 4. Tienda y pantalla | [`paso-04-tienda-y-pantalla/`](paso-04-tienda-y-pantalla/) | `Caché de Apollo: 5 entradas` con 2 peticiones `graphql`; también el aviso 401 al abrir sin sesión. |
| 5. Crear tareas | [`paso-05-crear-tareas/`](paso-05-crear-tareas/) | `Probar en Chrome` creada (201, 6 entradas); también el 422 junto al campo y el 401 arriba. |
| 6. Comprobación | [`paso-06-comprobacion/`](paso-06-comprobacion/) | Aplicación terminada y `grep` sin ninguna línea. |

## Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-10-27 | Carpetas por paso con código comentado, README y captura validada |
