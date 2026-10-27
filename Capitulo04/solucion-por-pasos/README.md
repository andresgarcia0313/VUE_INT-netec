# Capítulo 4 - Pinia: arquitectura de tiendas, código por paso

<!-- lang: es-CO -->

Una carpeta por paso de la [Práctica 4.4](https://andresgarcia0313.github.io/VUE_INT-netec/Capitulo04/). Cada una es un proyecto Vite completo y ejecutable con el código acumulado hasta ese paso, comentado para quien ve Vue y Pinia por primera vez, con su `README.md` y su `captura.png`. El último paso es igual en código a `ejercicio-resuelto/`.

| Paso | Carpeta | Qué se ve |
|---|---|---|
| Preparación | [`paso-00-preparacion/`](paso-00-preparacion/) | Proyecto recién creado: `You did it!` |
| 1. Diseño en papel | [`paso-01-diseno-en-papel/`](paso-01-diseno-en-papel/) | Tabla de las cinco tiendas (sin código nuevo) |
| 2. Pinia, sesión y guardia | [`paso-02-pinia-sesion-guardia/`](paso-02-pinia-sesion-guardia/) | Login con guardia; `Ana (editor)` en Proyectos |
| 3. Tiendas por dominio | [`paso-03-tiendas-por-dominio/`](paso-03-tiendas-por-dominio/) | `success - Errores registrados: 0` y dos proyectos |
| 4. Persistencia con plugin | [`paso-04-persistencia-plugin/`](paso-04-persistencia-plugin/) | Tras `F5` sigue Ana, oscuro y Pendientes |
| 5. Auditoría en desarrollo | [`paso-05-auditoria-desarrollo/`](paso-05-auditoria-desarrollo/) | Consola con `apiStatus.track`, `tasks.loadAll`, `projects.loadAll` |
| 6. Comprobación | [`paso-06-comprobacion/`](paso-06-comprobacion/) | Aplicación terminada; **Salir** y la guardia |

Para ejecutar cualquier paso: entra a su carpeta, `npm install` y `npx vite --port 5174`. Para empezar de cero, en la consola de Chrome: `localStorage.removeItem('projecthub:ui:v1')` y `localStorage.removeItem('projecthub:auth:v1')`.

## Control de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0 | 2026-10-27 | Andrés Eduardo García Márquez | Carpetas por paso (0 a 6) con código comentado, README y captura validada en Chrome; equivalencia del paso 6 con `ejercicio-resuelto/` comprobada |
