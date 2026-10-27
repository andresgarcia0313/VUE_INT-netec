# Capítulo 7 - Paso 7. Tres recorridos E2E con Cypress

<!-- lang: es-CO -->

Proyecto Vite completo con el código acumulado hasta este paso de la Práctica 7.4 (Catálogo Pro: estrategia de pruebas con Vitest, Vue Test Utils y Cypress). Los comentarios del código explican cada concepto.

## Qué cambió

Reemplazado: `cypress.config.js` (puerto 4177 y `video: false`). Borrado: `cypress/e2e/example.cy.js`. Nuevos: `cypress/fixtures/productos.json` y `cypress/e2e/catalogo.cy.js`. Este paso es igual en código a `ejercicio-resuelto/`, más comentarios.

## Concepto

Las E2E van en la punta de la pirámide: pocas, en un navegador real y sobre la aplicación compilada. `cy.intercept` responde por el servidor con datos fijos (fixture), `cy.wait('@productos')` espera la causa y no un número de milisegundos, y los selectores `data-cy` no dependen del diseño. `start-server-and-test` arranca `preview`, espera a que responda, corre Cypress y apaga el servidor.

## Cómo ejecutar

```bash
npm install              # instala las dependencias y descarga Cypress si falta
npm run test:e2e         # compila, sirve en 127.0.0.1:4177 y corre Cypress en Chrome sin ventana
```

## Qué debes ver

Según la guía: la compilación, el aviso de `preview` en `http://127.0.0.1:4177` y al final `Catálogo Pro en Chrome` con los tres recorridos aprobados, `3 passing` y `All specs passed!`.

## Captura

![`npm run test:e2e`: build de Vite, `preview` en `http://127.0.0.1:4177`, Cypress 14.5.4 en Chrome headless, los tres recorridos en verde, `3 passing` y `All specs passed!`. Extracto: se omitieron la caja `(Results)` y líneas internas de Chrome.](captura.png)

*`npm run test:e2e`: build de Vite, `preview` en `http://127.0.0.1:4177`, Cypress 14.5.4 en Chrome headless, los tres recorridos en verde, `3 passing` y `All specs passed!`. Extracto: se omitieron la caja `(Results)` y líneas internas de Chrome.*
