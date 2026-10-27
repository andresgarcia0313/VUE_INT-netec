# Capítulo 7 - Paso 5. El catálogo completo y su prueba con un doble

<!-- lang: es-CO -->

Proyecto Vite completo con el código acumulado hasta este paso de la Práctica 7.4 (Catálogo Pro: estrategia de pruebas con Vitest, Vue Test Utils y Cypress). Los comentarios del código explican cada concepto.

## Qué cambió

Nuevos: `public/api/productos.json` y `src/api.js`. Reemplazados: `src/main.js` (entrega el servicio con `provide`), `src/App.vue` (el catálogo) y `src/__tests__/App.spec.js` (prueba del catálogo con un doble).

## Concepto

`provide` e `inject` son la inyección de dependencias de Vue: `main.js` entrega el servicio real y la prueba entrega un doble hecho con `vi.fn()` (`mockResolvedValue` responde bien, `mockRejectedValue` falla) mediante `global.provide`. `flushPromises` espera la respuesta antes de comprobar. El filtro usa `computed`, que memoriza el resultado (capítulo 6).

## Cómo ejecutar

```bash
npm install              # instala las dependencias (una vez por carpeta; la primera vez descarga Cypress)
npx vite --port 5177     # como en la guía; abre http://localhost:5177
npm run test:run         # corre las pruebas unitarias y de componentes
```

## Qué debes ver

Según la guía: en `http://localhost:5177`, al escribir "mo" quedan Mouse inalámbrico y Monitor 4K; al marcar una estrella el resumen pasa a `Favoritos: 1 de 5`. Las pruebas: `Test Files  3 passed (3)` y `Tests  10 passed (10)`.

## Captura

![Catálogo en `http://localhost:5177` con "mo" en el buscador: Mouse inalámbrico (★, marcado) y Monitor 4K (☆), y el resumen `Favoritos: 1 de 5`.](captura.png)

*Catálogo en `http://localhost:5177` con "mo" en el buscador: Mouse inalámbrico (★, marcado) y Monitor 4K (☆), y el resumen `Favoritos: 1 de 5`.*

![`npm run test:run`: `3 passed (3)` y `10 passed (10)`.](captura-pruebas.png)

*`npm run test:run`: `3 passed (3)` y `10 passed (10)`.*
