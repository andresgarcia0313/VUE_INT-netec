# Capítulo 7 - Paso 6. Medir la cobertura

<!-- lang: es-CO -->

Proyecto Vite completo con el código acumulado hasta este paso de la Práctica 7.4 (Catálogo Pro: estrategia de pruebas con Vitest, Vue Test Utils y Cypress). Los comentarios del código explican cada concepto.

## Qué cambió

Ningún archivo cambia: es el mismo código del paso 5. Este paso solo ejecuta `npm run test:coverage`, que crea la carpeta `coverage/` (no se entrega).

## Concepto

La cobertura dice qué líneas, ramas y funciones ejecutaron las pruebas; la mide V8 con `@vitest/coverage-v8`. Los umbrales de `vitest.config.js` (80 % y 75 % de ramas) hacen fallar la orden si baja. Sirve para encontrar código que nadie tocó, no como meta: una línea ejecutada no es una línea comprobada.

## Cómo ejecutar

```bash
npm install              # instala las dependencias (una vez por carpeta)
npm run test:coverage    # pruebas con medición de cobertura; detalle en coverage/index.html
```

## Qué debes ver

Según la guía: una tabla con `App.vue`, `TarjetaProducto.vue` y `filtrarProductos.js`, `All files` en 100 % de líneas, ramas y funciones, y ningún `ERROR: Coverage for ... does not meet global threshold`. `main.js` y `api.js` no aparecen: se excluyeron.

## Captura

![Tabla de cobertura con `All files` y los tres archivos en 100 % y sin mensajes `ERROR`.](captura.png)

*Tabla de cobertura con `All files` y los tres archivos en 100 % y sin mensajes `ERROR`.*

![`coverage/index.html` abierto en Chrome: 100 % en `src`, `src/components` y `src/utils`. También se comprobó lo que dice la guía: sin la prueba del favorito sale `ERROR: Coverage for functions (75%) does not meet global threshold (80%)`.](captura-reporte.png)

*`coverage/index.html` abierto en Chrome: 100 % en `src`, `src/components` y `src/utils`. También se comprobó lo que dice la guía: sin la prueba del favorito sale `ERROR: Coverage for functions (75%) does not meet global threshold (80%)`.*
