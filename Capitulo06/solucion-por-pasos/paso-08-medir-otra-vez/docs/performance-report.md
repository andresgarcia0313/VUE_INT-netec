# Informe de rendimiento - Catálogo Pro

<!-- lang: es-CO -->

Condiciones: mismo equipo, Chrome en ventana de incógnito, Lighthouse en modo Navegación y Escritorio, compilación servida con `npm run preview`.

Valores medidos el 2026-10-27 en el equipo de prueba (Lighthouse 12.8.2 por línea de comandos, `--preset=desktop`, solo Rendimiento). Tus números pueden variar; lo que importa es comparar en las mismas condiciones.

| Medida | Antes | Después |
|---|---|---|
| Archivos JavaScript en `dist/assets` | 1 (`index-*.js`, 96,47 kB) | 4 (`vue-*.js` 92,84 kB, `index-*.js` 5,84 kB, `ReportesView-*.js` y `AdminView-*.js` de 0,36 kB) |
| JavaScript que descarga el catálogo (kB gzip) | 37,71 | 38,94 (`vue` 36,11 + `index` 2,83) |
| Puntuación de rendimiento de Lighthouse | 100 | 100 |
| LCP (s) | 0,4 | 0,4 |
| TBT (ms) | 50 | 20 |
| Nodos en la página del catálogo | 14.023 | 152 |
| Filas dibujadas | 2.000 | 18 |
| Cálculos del filtro al pulsar Contar nodos | 1 por clic (pasa de 1 a 2) | 0 (se queda en 1) |

## Cambios aplicados

- Paso 4: Reportes y Administración con `import()` (fragmentos aparte) y `manualChunks` para dejar Vue en `vue-*.js`.
- Paso 5: el filtro pasó de función en la plantilla a `computed` (memoización).
- Paso 6: lista virtual que dibuja 18 filas de 2.000.
- Paso 7: `v-memo="[p.precio, p.stock]"` en cada fila y `v-once` en la referencia.

## Conclusión

La página pasó de más de 14.000 nodos a 152 y de 2.000 filas a 18, y el filtro ya no se recalcula sin motivo. El JavaScript total del catálogo pesa casi lo mismo, pero ahora Vue viaja aparte y queda en caché entre publicaciones, y las vistas secundarias se descargan solo al visitarlas.
