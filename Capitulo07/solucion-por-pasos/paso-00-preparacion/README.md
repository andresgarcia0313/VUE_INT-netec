# Capítulo 7 - Preparación

<!-- lang: es-CO -->

Proyecto Vite completo con el código acumulado hasta este paso de la Práctica 7.4 (Catálogo Pro: estrategia de pruebas con Vitest, Vue Test Utils y Cypress). Los comentarios del código explican cada concepto.

## Qué cambió

Proyecto creado con `npx --yes create-vue@3.16.4 lab07-pruebas --bare --vitest --cypress`, con `vitest@3.2.7` y `@vitest/coverage-v8@3.2.7` fijados (`npm install -D -E`) y el bloque `"scripts"` de `package.json` reemplazado por el de la guía (puerto propio 4177, `test:run`, `test:coverage`, `cy:run` y `test:e2e`). Los demás archivos son los de create-vue, con comentarios.

## Concepto

`create-vue` es la herramienta oficial para crear proyectos de Vue con Vite. `--vitest` agrega Vitest y Vue Test Utils para pruebas unitarias y de componentes; `--cypress` agrega Cypress para las E2E; `--bare` deja una aplicación mínima. `npm install` corre al final el script `prepare` (`cypress install`), que descarga el programa de Cypress la primera vez.

## Cómo ejecutar

```bash
npm install              # instala las dependencias (una vez por carpeta; la primera vez descarga Cypress)
npm run test:run         # corre las pruebas unitarias y de componentes una sola vez
```

## Qué debes ver

Según la guía: la instalación termina con `added ... packages` y sin `ERR!`.

## Captura

![Instalación con `added 424 packages` (Cypress ya estaba: `Cypress 14.5.4 is installed`), la cobertura con `added 37 packages` y la prueba de ejemplo de create-vue en verde (`1 passed`). Extracto de la terminal: se omitieron los avisos `npm warn` y de auditoría.](captura.png)

*Instalación con `added 424 packages` (Cypress ya estaba: `Cypress 14.5.4 is installed`), la cobertura con `added 37 packages` y la prueba de ejemplo de create-vue en verde (`1 passed`). Extracto de la terminal: se omitieron los avisos `npm warn` y de auditoría.*
