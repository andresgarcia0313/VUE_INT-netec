# Capítulo 6 - Optimizar y medir una SPA, código por paso

<!-- lang: es-CO -->

Una carpeta por paso de la [Práctica 6.4](https://andresgarcia0313.github.io/VUE_INT-netec/Capitulo06/). Cada una es un proyecto Vite completo y ejecutable con el código acumulado hasta ese paso, comentado para quien ve estas técnicas por primera vez, con su `README.md` y su `captura.png`. El paso 8 es igual en código a `ejercicio-resuelto/`; el paso opcional agrega el logotipo encima de eso.

Para ejecutar cualquier paso: entra a la carpeta, `npm install` y `npm run dev` (o `npm run build` y `npm run preview` en los pasos de medición). `docs/performance-report.md` trae los valores medidos en el equipo de prueba: los tuyos pueden variar.

| Paso | Carpeta | Qué se ve |
|---|---|---|
| Preparación | [`paso-00-preparacion/`](paso-00-preparacion/) | "You did it!" y `rollup-plugin-visualizer@5.14.0` instalado. |
| 1. SPA de partida | [`paso-01-spa-de-partida/`](paso-01-spa-de-partida/) | 14056 nodos, 2000 filas y `Cálculos del filtro: 2` tras Contar nodos. |
| 2. Línea base | [`paso-02-linea-base/`](paso-02-linea-base/) | Un solo `index-*.js` de 96,47 kB; Lighthouse con 14.014 elementos de DOM y TBT 50 ms. |
| 3. Mapa del paquete | [`paso-03-mapa-del-paquete/`](paso-03-mapa-del-paquete/) | Mapa del paquete: `@vue` y `vue-router` ocupan casi todo. |
| 4. Rutas diferidas y manualChunks | [`paso-04-rutas-diferidas-y-manualchunks/`](paso-04-rutas-diferidas-y-manualchunks/) | `vue-*.js`, `index-*.js` y dos vistas aparte; `ReportesView-*.js` baja al visitar Reportes. |
| 5. Filtro con computed | [`paso-05-filtro-con-computed/`](paso-05-filtro-con-computed/) | `Cálculos del filtro: 1` tras tres clics en Contar nodos. |
| 6. Lista virtual | [`paso-06-lista-virtual/`](paso-06-lista-virtual/) | 185 nodos y 18 filas tras desplazar la lista. |
| 7. v-memo y v-once | [`paso-07-v-memo-y-v-once/`](paso-07-v-memo-y-v-once/) | Vender 1 baja el stock de 5 a 4; también la prueba con `v-memo` incompleto. |
| 8. Medir otra vez | [`paso-08-medir-otra-vez/`](paso-08-medir-otra-vez/) | 152 nodos, 18 filas, DOM de 142 elementos y TBT 20 ms; informe completo. |
| Opcional. Imagen con tamaño | [`paso-09-opcional-imagen-con-tamano/`](paso-09-opcional-imagen-con-tamano/) | Logotipo de 28 × 28 px en el encabezado. |

## Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-10-27 | Carpetas por paso con código comentado, README y captura validada |
