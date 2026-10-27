# Capítulo 1 - Práctica 1.4: diagnóstico y optimización de dibujos en una SPA

<!-- lang: es-CO -->

Una carpeta por paso de la guía. Cada carpeta es un proyecto Vite completo con el código acumulado hasta ese paso y comentarios que explican el concepto de Vue usado. El paso 6 es igual en código al `ejercicio-resuelto/` del repositorio.

Para ejecutar cualquier paso: entra a la carpeta, `npm install` y `npx vite --port 5171`.

| Paso | Carpeta | Qué se ve |
|---|---|---|
| Paso 0 | [`paso-00-preparacion`](paso-00-preparacion/) | Proyecto de create-vue: "You did it!" (el servidor aún no se arranca en la guía). |
| Paso 1 | [`paso-01-catalogo-de-partida`](paso-01-catalogo-de-partida/) | 12 tarjetas y contadores 0, 0 y 1. Con "cable", solo "Cable HDMI". |
| Paso 2 | [`paso-02-medir-el-problema`](paso-02-medir-el-problema/) | Teclado marcado: contadores 12, 1 y 1 (columna "Antes"). |
| Paso 3 | [`paso-03-filtro-con-computed`](paso-03-filtro-con-computed/) | Con `computed`: contadores 12, 1 y 0. |
| Paso 4 | [`paso-04-props-por-tarjeta`](paso-04-props-por-tarjeta/) | Con props y evento: contadores 1, 1 y 0. |
| Paso 5 | [`paso-05-shallowref`](paso-05-shallowref/) | Con `shallowRef`: "Producto nuevo 13" y "Favoritos: 0 de 13 productos". |
| Paso 6 | [`paso-06-cerrar-la-medicion`](paso-06-cerrar-la-medicion/) | Columna "Después": contadores 1, 1 y 0 con 13 productos. |

## Control de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0 | 2026-10-27 | Andrés Eduardo García Márquez | Carpetas por paso (0 a 6) con código comentado, README y captura validada en Chrome; equivalencia del paso 6 con `ejercicio-resuelto/` comprobada |
