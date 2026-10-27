# Capítulo 7 - Paso 3. Romperla a propósito y leer el error

<!-- lang: es-CO -->

Proyecto Vite completo con el código acumulado hasta este paso de la Práctica 7.4 (Catálogo Pro: estrategia de pruebas con Vitest, Vue Test Utils y Cypress). Los comentarios del código explican cada concepto.

## Qué cambió

Ningún archivo nuevo. El código queda como al final del paso (cambio deshecho); en `src/utils/filtrarProductos.js` un comentario indica qué cambiar para reproducir el fallo.

## Concepto

Vitest en modo vigilancia (`npm run test:unit`) repite las pruebas al guardar. El mensaje de fallo dice qué se esperaba (`- Expected`), qué llegó (`+ Received`) y en qué archivo, línea y columna está el `expect` que falló: es la pista para depurar.

## Cómo ejecutar

```bash
npm install              # instala las dependencias (una vez por carpeta)
npm run test:unit        # Vitest en modo vigilancia; pulsa q para salir
```

Con Vitest abierto, en la última línea de `src/utils/filtrarProductos.js` cambia `p.nombre.toLowerCase().includes(buscado)` por `p.nombre.includes(buscado)` y guarda. Después deshaz el cambio (`Ctrl + Z`) y guarda: vuelve a `3 passed`.

## Qué debes ver

Según la guía: Vitest marca en rojo el caso normal: `expected [] to deeply equal [ 1, 3 ]`, con `- Expected` y `+ Received`, la ubicación `❯ src/__tests__/filtrarProductos.spec.js:13:40`, un `^` bajo el `expect` y `FAIL  Tests failed. Watching for file changes...`.

## Captura

![Modo vigilancia tras guardar el cambio: `RERUN src/utils/filtrarProductos.js`, el diff `- Expected` / `+ Received`, la ubicación `filtrarProductos.spec.js:13:40` con el `^` y `FAIL  Tests failed. Watching for file changes...`. Al deshacer el cambio se comprobó `PASS` con `3 passed (3)`.](captura.png)

*Modo vigilancia tras guardar el cambio: `RERUN src/utils/filtrarProductos.js`, el diff `- Expected` / `+ Received`, la ubicación `filtrarProductos.spec.js:13:40` con el `^` y `FAIL  Tests failed. Watching for file changes...`. Al deshacer el cambio se comprobó `PASS` con `3 passed (3)`.*
