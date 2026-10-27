# Capítulo 7 - Paso 2. Vitest y una función pura

<!-- lang: es-CO -->

Proyecto Vite completo con el código acumulado hasta este paso de la Práctica 7.4 (Catálogo Pro: estrategia de pruebas con Vitest, Vue Test Utils y Cypress). Los comentarios del código explican cada concepto.

## Qué cambió

Cambiado: `vitest.config.js` (líneas `NUEVO`: `setupFiles` y `coverage`). Nuevos: `vitest.setup.js`, `src/utils/filtrarProductos.js` y `src/__tests__/filtrarProductos.spec.js`.

## Concepto

Una función pura devuelve siempre lo mismo con los mismos datos y no toca nada más: se prueba sola, sin Vue ni red. Cada prueba sigue preparar, ejecutar y verificar (`describe`, `it`, `expect`), con tres casos: normal, borde y error. `enableAutoUnmount` desmonta los componentes al final de cada prueba.

## Cómo ejecutar

```bash
npm install              # instala las dependencias (una vez por carpeta; la primera vez descarga Cypress)
npm run test:run         # corre las pruebas unitarias y de componentes una sola vez
```

## Qué debes ver

Según la guía: tus tres pruebas y la de ejemplo de create-vue: `Test Files  2 passed (2)` y `Tests  4 passed (4)`.

## Captura

![`filtrarProductos.spec.js (3 tests)` y `App.spec.js (1 test)` en verde: `2 passed (2)` y `4 passed (4)`.](captura.png)

*`filtrarProductos.spec.js (3 tests)` y `App.spec.js (1 test)` en verde: `2 passed (2)` y `4 passed (4)`.*
