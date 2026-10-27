# Paso 5. Comprobar el contexto y retirar la versión anterior

<!-- lang: es-CO -->

Práctica 2.4, ProjectHub: refactorizar de Options API a Composition API con composables.

## Qué cambió en este paso

- Reemplazado: `src/App.vue` (solo `ProjectHubView`).
- Borrado: `src/TareasOpciones.vue`.
- Es el proyecto terminado, igual en código a `ejercicio-resuelto/` (solo cambian los comentarios).

## Concepto

Una refactorización termina retirando la versión vieja. `useProjectHubContext` lanza un error con nombre si alguien pide el contexto fuera de `ProjectHubView`, así el fallo dice qué falta y dónde. `npm run build` prueba que todo compila.

## Cómo ejecutar

```bash
npm install              # instala las dependencias (una vez por carpeta)
npx vite --port 5172     # como en la guía; también sirve npm run dev (puerto 5173)
```

Abre `http://localhost:5172/` en Chrome.

## Qué debes ver

Según la guía: la aplicación muestra solo la columna **Después**, y la terminal termina con `✓ built in` y sin errores. En el opcional 5.1, la consola muestra `[Vue warn]: injection "Symbol(projectHub)" not found`, `[Vue warn]: Unhandled error during execution of setup function` y `Uncaught Error: useProjectHubContext debe utilizarse dentro de ProjectHubView`, y la página queda en blanco.

## Captura

![Solo la columna **Después**, con "Seleccionada: Conectar la API de proyectos". `vite build` terminó con `✓ built in 1.23s`.](captura.png)

*Solo la columna **Después**, con "Seleccionada: Conectar la API de proyectos". `vite build` terminó con `✓ built in 1.23s`.*

![Opcional 5.1 (en una copia aparte): `<TaskCollectionProvider />` fuera de `ProjectHubView`. Página en blanco y, en la franja de consola, los dos avisos y el error de la guía.](captura-sin-proveedor.png)

*Opcional 5.1 (en una copia aparte): `<TaskCollectionProvider />` fuera de `ProjectHubView`. Página en blanco y, en la franja de consola, los dos avisos y el error de la guía.*

Capturas tomadas en Chrome sin interfaz con el servidor en el puerto 5372, por eso no se ve la barra de direcciones. La franja oscura, cuando aparece, reproduce lo que muestra la consola de `F12`.
