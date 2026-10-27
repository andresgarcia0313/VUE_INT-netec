# Capítulo 8 - Paso 2. La app web consume el paquete

<!-- lang: es-CO -->

Monorepo con el código acumulado hasta este paso de la Práctica 8.4 (Catálogo Pro con pnpm workspaces, Docker y GitHub Actions). Los comentarios del código explican cada concepto.

## Qué cambió

Nueva: `apps/web/`, creada dentro de `apps/` con `npx --yes create-vue@3.16.4 web --bare --router`. Reemplazados: `apps/web/package.json`, `apps/web/src/router/index.js` y `apps/web/src/App.vue`. Nuevos: `apps/web/src/vistas/InicioVista.vue` y `apps/web/src/vistas/CatalogoVista.vue`. `pnpm-lock.yaml` se actualiza con la app. Los demás archivos de create-vue quedan sin cambios (solo comentarios).

## Concepto

La app importa el componente compartido solo por la puerta de entrada (`import { EtiquetaEstado } from '@catalogo/ui'`), nunca por una ruta interna. Vite sigue el enlace de `workspace:*` hasta `packages/ui` y compila el `.vue` como si fuera de la app. Vue Router muestra una vista por dirección (`/` y `/catalogo`).

## Cómo ejecutar

```bash
npm install -g pnpm@9.15.4   # pnpm en la versión del curso (una sola vez por equipo)
pnpm install              # enlaza @catalogo/ui dentro de apps/web
pnpm build                # compila la app web (pnpm --filter @catalogo/web build)
pnpm dev                  # opcional: http://127.0.0.1:5178/catalogo
```

## Qué debes ver

Según la guía: `✓ built in` y unos segundos. Vite siguió el enlace de `workspace:*` hasta `packages/ui` y compiló el componente como si fuera de la app.

## Captura

![`pnpm install` (`Scope: all 4 workspace projects`, bloqueo al día) y `pnpm build` con `✓ built in 1.97s`.](captura.png)

*`pnpm install` (`Scope: all 4 workspace projects`, bloqueo al día) y `pnpm build` con `✓ built in 1.97s`.*

![`http://127.0.0.1:5178/catalogo` con `pnpm dev`: Teclado (Activo, verde), Monitor (Agotado, rojo) y Ratón (Pendiente, gris), dibujados por `EtiquetaEstado` de `@catalogo/ui`.](captura-catalogo.png)

*`http://127.0.0.1:5178/catalogo` con `pnpm dev`: Teclado (Activo, verde), Monitor (Agotado, rojo) y Ratón (Pendiente, gris), dibujados por `EtiquetaEstado` de `@catalogo/ui`.*
