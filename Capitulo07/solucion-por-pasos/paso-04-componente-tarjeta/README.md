# Capítulo 7 - Paso 4. Probar un componente por lo que muestra y avisa

<!-- lang: es-CO -->

Proyecto Vite completo con el código acumulado hasta este paso de la Práctica 7.4 (Catálogo Pro: estrategia de pruebas con Vitest, Vue Test Utils y Cypress). Los comentarios del código explican cada concepto.

## Qué cambió

Nuevos: `src/components/TarjetaProducto.vue` y `src/__tests__/TarjetaProducto.spec.js`.

## Concepto

El contrato de un componente es lo que entra (props) y lo que sale (eventos con `emit`). Vue Test Utils lo monta en jsdom con `mount`; la prueba lee lo que vería la persona (`get(...).text()`, `attributes`) y lo que avisó (`emitted`), nunca variables internas ni clases CSS.

## Cómo ejecutar

```bash
npm install              # instala las dependencias (una vez por carpeta; la primera vez descarga Cypress)
npm run test:run         # corre las pruebas unitarias y de componentes una sola vez
```

## Qué debes ver

Según la guía: `Test Files  3 passed (3)` y `Tests  7 passed (7)`.

## Captura

![`App.spec.js`, `TarjetaProducto.spec.js` y `filtrarProductos.spec.js` en verde: `3 passed (3)` y `7 passed (7)`.](captura.png)

*`App.spec.js`, `TarjetaProducto.spec.js` y `filtrarProductos.spec.js` en verde: `3 passed (3)` y `7 passed (7)`.*
