# Capítulo 7 - Estrategia de pruebas, código por paso

<!-- lang: es-CO -->

Una carpeta por paso de la [Práctica 7.4](https://andresgarcia0313.github.io/VUE_INT-netec/Capitulo07/). Cada una es un proyecto Vite completo y ejecutable con el código acumulado hasta ese paso, comentado para quien ve pruebas en Vue por primera vez, con su `README.md` y su `captura.png`. El último paso es igual en código a `ejercicio-resuelto/`.

| Paso | Carpeta | Qué se ve |
|---|---|---|
| Preparación | [`paso-00-preparacion/`](paso-00-preparacion/) | `added ... packages` sin `ERR!` y la prueba de ejemplo en verde |
| 1. Estrategia antes que las pruebas | [`paso-01-estrategia-de-pruebas/`](paso-01-estrategia-de-pruebas/) | `docs/test-strategy.md`: pirámide, riesgos, excluidas y criterios |
| 2. Vitest y una función pura | [`paso-02-vitest-y-funcion-pura/`](paso-02-vitest-y-funcion-pura/) | `Test Files  2 passed (2)` y `Tests  4 passed (4)` |
| 3. Romperla y leer el error | [`paso-03-romper-y-leer-el-error/`](paso-03-romper-y-leer-el-error/) | `expected [] to deeply equal [ 1, 3 ]` en `filtrarProductos.spec.js:13:40` |
| 4. Componente por lo que muestra y avisa | [`paso-04-componente-tarjeta/`](paso-04-componente-tarjeta/) | `Test Files  3 passed (3)` y `Tests  7 passed (7)` |
| 5. Catálogo y prueba con un doble | [`paso-05-catalogo-y-doble/`](paso-05-catalogo-y-doble/) | "mo" deja Mouse y Monitor, `Favoritos: 1 de 5`; `Tests  10 passed (10)` |
| 6. Cobertura | [`paso-06-cobertura/`](paso-06-cobertura/) | `All files` en 100 % y sin `ERROR: Coverage` |
| 7. E2E con Cypress | [`paso-07-e2e-con-cypress/`](paso-07-e2e-con-cypress/) | `3 passing` y `All specs passed!` en Chrome |

Para ejecutar cualquier paso: entra a su carpeta, `npm install` y la orden de su `README.md` (`npm run test:run`, `npx vite --port 5177`, `npm run test:coverage` o `npm run test:e2e`). La primera instalación descarga Cypress (unos 600 MB).

## Control de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0 | 2026-10-27 | Andrés Eduardo García Márquez | Carpetas por paso (0 a 7) con código comentado, README y captura validada; pruebas, cobertura y Cypress ejecutados en cada paso; equivalencia del paso 7 con `ejercicio-resuelto/` comprobada |
