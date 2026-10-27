# Capítulo 8 - Paso 1. Monorepo y paquetes compartidos

<!-- lang: es-CO -->

Monorepo con el código acumulado hasta este paso de la Práctica 8.4 (Catálogo Pro con pnpm workspaces, Docker y GitHub Actions). Los comentarios del código explican cada concepto.

## Qué cambió

Nuevos en la raíz: `package.json`, `pnpm-workspace.yaml`, `.gitignore` y `pnpm-lock.yaml` (lo genera `pnpm install`). Nuevos en `packages/config/`: `package.json` y `vitest.config.js`. Nuevos en `packages/ui/`: `package.json`, `vitest.config.js`, `src/estado.js`, `src/estado.test.js`, `src/EtiquetaEstado.vue` y `src/index.js`.

## Concepto

La raíz solo coordina; lo reutilizable vive en `packages/`. `exports` en cada `package.json` es la puerta de entrada: desde fuera solo se importa lo que ahí se declara. `workspace:*` enlaza el paquete hermano en lugar de descargarlo. Las dependencias van en un solo sentido: `web` usa `ui` y `ui` usa `config`.

## Cómo ejecutar

```bash
npm install -g pnpm@9.15.4   # pnpm en la versión del curso (una sola vez por equipo)
pnpm install              # instala todos los paquetes del monorepo
pnpm test                 # corre test en cada paquete que lo tenga (-r --if-present)
```

## Qué debes ver

Según la guía: `Scope: all 3 workspace projects` al instalar; después las dos pruebas con `✓` y `Tests  2 passed (2)`.

## Captura

![`pnpm install` con `Scope: all 3 workspace projects` y `pnpm test` con las dos pruebas de `etiquetaDeEstado` en verde: `Tests  2 passed (2)`.](captura.png)

*`pnpm install` con `Scope: all 3 workspace projects` y `pnpm test` con las dos pruebas de `etiquetaDeEstado` en verde: `Tests  2 passed (2)`.*
