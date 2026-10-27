# Capítulo 7 - Paso 1. Estrategia antes que las pruebas

<!-- lang: es-CO -->

Proyecto Vite completo con el código acumulado hasta este paso de la Práctica 7.4 (Catálogo Pro: estrategia de pruebas con Vitest, Vue Test Utils y Cypress). Los comentarios del código explican cada concepto.

## Qué cambió

Nuevo: `docs/test-strategy.md`. Ningún archivo de código cambia.

## Concepto

Una estrategia de pruebas decide tres cosas: qué riesgos importan, en qué piso de la pirámide se prueba cada uno (unitarias, componentes, E2E) y qué no se prueba. Escribirla primero evita probar "todo" y dejar sin cubrir lo importante; los pasos 2 a 7 cumplen cada fila.

## Cómo ejecutar

```bash
npm install              # instala las dependencias (una vez por carpeta; la primera vez descarga Cypress)
npm run test:run         # corre las pruebas unitarias y de componentes una sola vez
```

## Qué debes ver

Según la guía: el archivo con cuatro secciones: pirámide, riesgos, excluidas y criterios.

## Captura

![`docs/test-strategy.md` en vista previa: pirámide, riesgos priorizados, pruebas excluidas y criterios de calidad.](captura.png)

*`docs/test-strategy.md` en vista previa: pirámide, riesgos priorizados, pruebas excluidas y criterios de calidad.*
