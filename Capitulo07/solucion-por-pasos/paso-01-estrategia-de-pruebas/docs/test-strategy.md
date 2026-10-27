# Estrategia de pruebas de Catálogo Pro

<!-- Una estrategia decide qué riesgos importan, en qué piso de la pirámide se prueba cada uno y qué NO se prueba. -->
<!-- Se escribe antes que las pruebas: así cada prueba de los pasos 2 a 7 cumple una fila de este documento. -->

## Pirámide de pruebas

<!-- Muchas pruebas rápidas abajo (unitarias) y pocas lentas arriba (E2E en un navegador real). -->

| Nivel | Proporción | Qué cubre | Herramienta |
|---|---:|---|---|
| Unitarias | 60 % | Funciones puras, como filtrarProductos | Vitest |
| Componentes | 30 % | Lo que un componente muestra y avisa | Vue Test Utils y jsdom |
| E2E | 10 % | Recorridos que no pueden fallar | Cypress en Chrome |

## Riesgos priorizados

<!-- Se prueba primero lo que más daño hace si falla, no "todo". -->

| Riesgo | Impacto | Dónde se prueba |
|---|---|---|
| El filtro muestra productos equivocados | Alto | Unitaria y E2E |
| La estrella no marca o no desmarca el favorito | Alto | Componente y E2E |
| El servidor falla y la pantalla queda en blanco | Alto | Componente y E2E |

## Pruebas excluidas

<!-- Decir qué no se prueba evita pruebas caras, frágiles o repetidas. -->

- Comparar píxeles: se rompe con cada cambio de estilo.
- Medir rendimiento dentro de jsdom: jsdom no dibuja de verdad.
- Cada combinación de filtros en E2E: es lento y ya lo cubren las unitarias.
- El servidor real: las E2E responden con datos fijos.

## Criterios de calidad

- npm run test:run y npm run test:e2e en verde antes de entregar un cambio.
- Cobertura mínima: 80 % de líneas, funciones y sentencias; 75 % de ramas.
- Ninguna E2E espera un número fijo de milisegundos.
- Todo error corregido llega con una prueba que lo habría detectado.
