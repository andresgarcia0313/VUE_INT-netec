# Capítulo 8 - Preparación

<!-- lang: es-CO -->

Monorepo con el código acumulado hasta este paso de la Práctica 8.4 (Catálogo Pro con pnpm workspaces, Docker y GitHub Actions). Los comentarios del código explican cada concepto.

## Qué cambió

Todavía no hay código: la carpeta del proyecto (`catalogo-platform`) arranca vacía, con `git init -b main`. Esta carpeta solo trae este README y la captura de las herramientas.

## Concepto

Un monorepo necesita un gestor que entienda varios paquetes en un mismo repositorio: pnpm, fijado en 9.15.4 para que todos instalen igual. Docker construye la imagen del paso 4 y `gh` (GitHub CLI) sube el repositorio en el paso 5; el permiso `workflow` deja subir archivos de `.github/workflows`.

## Cómo ejecutar

```bash
npm install -g pnpm@9.15.4   # pnpm en la versión del curso (una sola vez por equipo)
pnpm --version
docker version
gh auth status
mkdir catalogo-platform
cd catalogo-platform
git init -b main
```

## Qué debes ver

Según la guía: `9.15.4`, una sección `Server` en `docker version` y `Logged in to github.com`.

## Captura

![`pnpm --version` da `9.15.4`; `docker version` muestra la sección `Server` (motor 29.1.3); `gh auth status` dice `Logged in to github.com` con el permiso `workflow`; `git init -b main` crea el repositorio vacío.](captura.png)

*`pnpm --version` da `9.15.4`; `docker version` muestra la sección `Server` (motor 29.1.3); `gh auth status` dice `Logged in to github.com` con el permiso `workflow`; `git init -b main` crea el repositorio vacío.*
