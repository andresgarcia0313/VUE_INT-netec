# Capítulo 4 - Paso Preparación

<!-- lang: es-CO -->

Proyecto Vite completo con el código acumulado hasta este paso de la Práctica 4.4 (ProjectHub con Pinia). Los comentarios del código explican cada concepto.

## Qué cambió

Proyecto creado con `npx --yes create-vue@3.16.4 projecthub --bare --router --pinia`. Se borró `src/stores/counter.js` (queda `src/stores/` vacía, con `.gitkeep` para que git la conserve) y en `index.html` se cambió `lang="es"` y el título a `ProjectHub`.

## Concepto

`create-vue` es la herramienta oficial para crear proyectos de Vue con Vite. `--router` agrega Vue Router y `--pinia` agrega Pinia, la librería oficial de estado compartido; `main.js` ya instala los dos con `app.use(...)`.

## Cómo ejecutar

```bash
npm install              # instala las dependencias (una vez por carpeta)
npx vite --port 5174     # como en la guía; también sirve npm run dev (puerto 5173)
```

Abre `http://localhost:5174/` en Chrome.

## Qué debes ver

Según la guía: `added ... packages` sin errores; en `package.json`, `pinia` y `vue-router` dentro de `dependencies`, y en `src/` quedan `App.vue`, `main.js`, `router/index.js` y la carpeta `stores` vacía.

![La página muestra `You did it!`; el panel inferior confirma `título: ProjectHub | lang: es`. El aviso `No match found for location with path "/"` es normal: el enrutador todavía no tiene rutas.](captura.png)

*La página muestra `You did it!`; el panel inferior confirma `título: ProjectHub | lang: es`. El aviso `No match found for location with path "/"` es normal: el enrutador todavía no tiene rutas.*
