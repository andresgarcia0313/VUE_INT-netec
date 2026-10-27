# Informe de rendimiento - Catálogo Pro

<!-- lang: es-CO -->

Condiciones: mismo equipo, Chrome en ventana de incógnito, Lighthouse en modo Navegación y Escritorio, compilación servida con `npm run preview`.

Valores medidos el 2026-10-27 en el equipo de prueba (Lighthouse 12.8.2 por línea de comandos, `--preset=desktop`, solo Rendimiento). Tus números pueden variar; lo que importa es comparar en las mismas condiciones.

| Medida | Antes | Después |
|---|---|---|
| Archivos JavaScript en `dist/assets` | 1 (`index-*.js`, 96,47 kB) | |
| JavaScript que descarga el catálogo (kB gzip) | 37,71 | |
| Puntuación de rendimiento de Lighthouse | 100 | |
| LCP (s) | 0,4 | |
| TBT (ms) | 50 | |
| Nodos en la página del catálogo | 14.023 | |
| Filas dibujadas | 2.000 | |
| Cálculos del filtro al pulsar Contar nodos | 1 por clic (pasa de 1 a 2) | |

## Cambios aplicados

## Conclusión
