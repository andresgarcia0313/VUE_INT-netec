# Capítulo 8 - Paso 5. Pipeline de CI y release en GitHub Actions

<!-- lang: es-CO -->

Monorepo con el código acumulado hasta este paso de la Práctica 8.4 (Catálogo Pro con pnpm workspaces, Docker y GitHub Actions). Los comentarios del código explican cada concepto.

## Qué cambió

Nuevos: `.github/workflows/ci.yml` y `.github/workflows/release.yml`.

## Concepto

Integración continua (CI): en cada cambio a `main` una máquina de GitHub instala, prueba y compila. Entrega continua: al subir una etiqueta `v1.0.0`, `release.yml` construye la imagen del paso 4 y la publica en ghcr.io con la versión y el SHA (identificador del commit). `pnpm/action-setup` va antes de `setup-node` porque la caché de pnpm necesita pnpm instalado.

## Cómo ejecutar

```bash
git add .
git commit -m "feat: plataforma de catalogo"
gh repo create catalogo-platform --private --source=. --remote=origin --push
gh run list --limit 2
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
gh run list --limit 3
```

En esta carpeta no se hizo el `push`: el código queda listo y se validó en local (ver la captura).

## Qué debes ver

Según la guía: el primer `gh run list` muestra solo CI; el segundo, CI y Release, hasta ver los dos en `completed  success`. En **Packages** aparece `catalogo-platform` con las etiquetas `1.0.0` y el SHA de 12 caracteres.

## Captura

![Validación local sin subir a GitHub: `actionlint` revisa los dos flujos sin hallazgos (salida 0); los tres `run:` del trabajo `calidad` (`pnpm install --frozen-lockfile`, `pnpm test` con `2 passed`, `pnpm build` con `✓ built`) pasan, y el `run:` de `release.yml` calcula `ghcr.io/alumno/catalogo-platform:1.0.0` y la etiqueta de 12 caracteres del SHA (con un SHA de ejemplo; `docker build` y `push` no se ejecutan).](captura.png)

*Validación local sin subir a GitHub: `actionlint` revisa los dos flujos sin hallazgos (salida 0); los tres `run:` del trabajo `calidad` (`pnpm install --frozen-lockfile`, `pnpm test` con `2 passed`, `pnpm build` con `✓ built`) pasan, y el `run:` de `release.yml` calcula `ghcr.io/alumno/catalogo-platform:1.0.0` y la etiqueta de 12 caracteres del SHA (con un SHA de ejemplo; `docker build` y `push` no se ejecutan).*
