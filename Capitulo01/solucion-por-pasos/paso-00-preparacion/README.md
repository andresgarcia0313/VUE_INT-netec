# Paso 0. Preparación

<!-- lang: es-CO -->

Proyecto recién creado con `npx --yes create-vue@3.16.4 catalogo --default --bare`.

## Qué cambió en este paso

- Todos los archivos vienen de create-vue.
- Cambiado: `index.html` (`lang="es"` y título `Catálogo - Laboratorio 1`).
- Solo se agregaron comentarios a `src/main.js`, `src/App.vue` e `index.html`.

## Concepto

`--bare` deja un proyecto mínimo: `main.js` crea la aplicación con `createApp(App)` y la monta en `<div id="app">`. `App.vue` es un componente de un solo archivo (SFC) que junta script, plantilla y estilos.

## Cómo ejecutar

```bash
npm install              # instala las dependencias (una vez por carpeta)
npx vite --port 5171     # como en la guía; también sirve npm run dev (puerto 5173)
```

Abre `http://localhost:5171/` en Chrome.

## Qué debes ver

Según la guía: `npm install` termina con `added ... packages` y sin errores en rojo.

## Captura

![La guía no arranca el servidor en este paso; si lo haces, ves el título "You did it!" del proyecto de create-vue y el botón flotante de las Vue DevTools abajo. La pestaña dice "Catálogo - Laboratorio 1".](captura.png)

*La guía no arranca el servidor en este paso; si lo haces, ves el título "You did it!" del proyecto de create-vue y el botón flotante de las Vue DevTools abajo. La pestaña dice "Catálogo - Laboratorio 1".*

Capturas tomadas en Chrome sin interfaz con el servidor en el puerto 5371, por eso no se ve la barra de direcciones.
